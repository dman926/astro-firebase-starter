ALTER TABLE
  clients DROP COLUMN contact_info;

ALTER TABLE
  clients
ADD
  COLUMN email Varchar(255),
ADD
  COLUMN phone_number Varchar(15),
ADD
  CONSTRAINT sessions_proper_email CHECK (
    email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'
  );