-- Migration: 0001_initial
-- Yacita — schema inicial completo

-- Habilitar extensiones necesarias en Supabase
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm"   SCHEMA extensions;

-- ─────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────

CREATE TYPE "GapStatus"     AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "Plan"          AS ENUM ('BASIC', 'PRO');
CREATE TYPE "SubStatus"     AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED');
CREATE TYPE "UserRole"      AS ENUM ('PATIENT', 'CLINIC_OWNER', 'ADMIN');

-- ─────────────────────────────────────────
-- Tabla: users
-- ─────────────────────────────────────────

CREATE TABLE "users" (
    "id"           TEXT         NOT NULL,
    "email"        TEXT         NOT NULL,
    "passwordHash" TEXT         NOT NULL,
    "name"         TEXT         NOT NULL,
    "avatar"       TEXT,
    "lat"          DOUBLE PRECISION,
    "lng"          DOUBLE PRECISION,
    "pushToken"    TEXT,
    "role"         "UserRole"   NOT NULL DEFAULT 'PATIENT',
    "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX        "users_email_idx" ON "users"("email");

-- ─────────────────────────────────────────
-- Tabla: clinics
-- ─────────────────────────────────────────

CREATE TABLE "clinics" (
    "id"          TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "address"     TEXT         NOT NULL,
    "lat"         DOUBLE PRECISION NOT NULL,
    "lng"         DOUBLE PRECISION NOT NULL,
    "photos"      TEXT[]       NOT NULL DEFAULT '{}',
    "services"    TEXT[]       NOT NULL DEFAULT '{}',
    "description" TEXT,
    "ownerId"     TEXT         NOT NULL,
    "verified"    BOOLEAN      NOT NULL DEFAULT FALSE,
    "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "clinics_pkey"    PRIMARY KEY ("id"),
    CONSTRAINT "clinics_owner_fk" FOREIGN KEY ("ownerId")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "clinics_ownerId_idx" ON "clinics"("ownerId");
CREATE INDEX "clinics_lat_lng_idx" ON "clinics"("lat", "lng");

-- ─────────────────────────────────────────
-- Tabla: gaps
-- ─────────────────────────────────────────

CREATE TABLE "gaps" (
    "id"            TEXT              NOT NULL,
    "clinicId"      TEXT              NOT NULL,
    "datetime"      TIMESTAMPTZ       NOT NULL,
    "durationMins"  INTEGER           NOT NULL,
    "service"       TEXT              NOT NULL,
    "stdPrice"      DOUBLE PRECISION  NOT NULL,
    "discountPrice" DOUBLE PRECISION  NOT NULL,
    "maxBookings"   INTEGER           NOT NULL DEFAULT 1,
    "status"        "GapStatus"       NOT NULL DEFAULT 'AVAILABLE',
    "createdAt"     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT "gaps_pkey"      PRIMARY KEY ("id"),
    CONSTRAINT "gaps_clinic_fk" FOREIGN KEY ("clinicId")
        REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "gaps_clinicId_idx" ON "gaps"("clinicId");
CREATE INDEX "gaps_datetime_idx" ON "gaps"("datetime");
CREATE INDEX "gaps_status_idx"   ON "gaps"("status");
CREATE INDEX "gaps_service_idx"  ON "gaps"("service");

-- ─────────────────────────────────────────
-- Tabla: bookings
-- ─────────────────────────────────────────

CREATE TABLE "bookings" (
    "id"        TEXT            NOT NULL,
    "gapId"     TEXT            NOT NULL,
    "userId"    TEXT            NOT NULL,
    "status"    "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "note"      TEXT,
    "createdAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT "bookings_pkey"    PRIMARY KEY ("id"),
    CONSTRAINT "bookings_gap_fk"  FOREIGN KEY ("gapId")
        REFERENCES "gaps"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_user_fk" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_gap_user_uq" UNIQUE ("gapId", "userId")
);

CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_gapId_idx"  ON "bookings"("gapId");

-- ─────────────────────────────────────────
-- Tabla: subscriptions
-- ─────────────────────────────────────────

CREATE TABLE "subscriptions" (
    "id"               TEXT        NOT NULL,
    "clinicId"         TEXT        NOT NULL,
    "stripeCustomerId" TEXT        NOT NULL,
    "stripeSubId"      TEXT        NOT NULL,
    "plan"             "Plan"      NOT NULL DEFAULT 'BASIC',
    "status"           "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMPTZ NOT NULL,
    "cancelAtEnd"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "subscriptions_pkey"      PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_clinic_fk" FOREIGN KEY ("clinicId")
        REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_clinicId_uq"         UNIQUE ("clinicId"),
    CONSTRAINT "subscriptions_stripeCustomerId_uq"  UNIQUE ("stripeCustomerId"),
    CONSTRAINT "subscriptions_stripeSubId_uq"       UNIQUE ("stripeSubId")
);

CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");
CREATE INDEX "subscriptions_stripeSubId_idx"      ON "subscriptions"("stripeSubId");

-- ─────────────────────────────────────────
-- Tabla: push_notifications
-- ─────────────────────────────────────────

CREATE TABLE "push_notifications" (
    "id"        TEXT        NOT NULL,
    "userId"    TEXT        NOT NULL,
    "title"     TEXT        NOT NULL,
    "body"      TEXT        NOT NULL,
    "data"      JSONB,
    "sent"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "sentAt"    TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "push_notifications_userId_sent_idx" ON "push_notifications"("userId", "sent");

-- ─────────────────────────────────────────
-- Función: updatedAt automático
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger en todas las tablas con updatedAt
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','clinics','gaps','bookings','subscriptions'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────
-- Vista: gaps con distancia (para queries Haversine en raw SQL)
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION gaps_near(
  p_lat    DOUBLE PRECISION,
  p_lng    DOUBLE PRECISION,
  p_radius DOUBLE PRECISION DEFAULT 10.0,  -- km
  p_type   TEXT             DEFAULT NULL,
  p_date   DATE             DEFAULT NULL
)
RETURNS TABLE (
  gap_id         TEXT,
  clinic_id      TEXT,
  clinic_name    TEXT,
  clinic_address TEXT,
  clinic_lat     DOUBLE PRECISION,
  clinic_lng     DOUBLE PRECISION,
  clinic_photos  TEXT[],
  clinic_verified BOOLEAN,
  datetime       TIMESTAMPTZ,
  duration_mins  INTEGER,
  service        TEXT,
  std_price      DOUBLE PRECISION,
  discount_price DOUBLE PRECISION,
  max_bookings   INTEGER,
  status         "GapStatus",
  distance_km    DOUBLE PRECISION,
  discount_pct   INTEGER
)
LANGUAGE sql STABLE AS $$
  SELECT
    g."id"                                    AS gap_id,
    c."id"                                    AS clinic_id,
    c."name"                                  AS clinic_name,
    c."address"                               AS clinic_address,
    c."lat"                                   AS clinic_lat,
    c."lng"                                   AS clinic_lng,
    c."photos"                                AS clinic_photos,
    c."verified"                              AS clinic_verified,
    g."datetime",
    g."durationMins"                          AS duration_mins,
    g."service",
    g."stdPrice"                              AS std_price,
    g."discountPrice"                         AS discount_price,
    g."maxBookings"                           AS max_bookings,
    g."status",
    -- Haversine (km)
    6371 * 2 * ASIN(
      SQRT(
        POWER(SIN(RADIANS(c."lat" - p_lat) / 2), 2) +
        COS(RADIANS(p_lat)) * COS(RADIANS(c."lat")) *
        POWER(SIN(RADIANS(c."lng" - p_lng) / 2), 2)
      )
    )                                         AS distance_km,
    ROUND(((g."stdPrice" - g."discountPrice") / g."stdPrice") * 100)::INTEGER AS discount_pct
  FROM "gaps" g
  JOIN "clinics" c ON c."id" = g."clinicId"
  WHERE
    g."status" = 'AVAILABLE'
    AND g."datetime" > NOW()
    AND (p_type IS NULL OR g."service" = p_type)
    AND (p_date IS NULL OR g."datetime"::DATE = p_date)
    AND 6371 * 2 * ASIN(
          SQRT(
            POWER(SIN(RADIANS(c."lat" - p_lat) / 2), 2) +
            COS(RADIANS(p_lat)) * COS(RADIANS(c."lat")) *
            POWER(SIN(RADIANS(c."lng" - p_lng) / 2), 2)
          )
        ) <= p_radius
  ORDER BY distance_km ASC, g."datetime" ASC;
$$;
