CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  contact_info VARCHAR(255),
  CONSTRAINT clients_pk PRIMARY KEY (id)
);

CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4(),
  client_id UUID,
  session_date DATE,
  location VARCHAR(255),
  session_type VARCHAR(255),
  duration_hours INT,
  package VARCHAR(255),
  total_cost DECIMAL(10, 2),
  notes TEXT,
  CONSTRAINT sessions_pk PRIMARY KEY (id),
  CONSTRAINT sessions_clients_fk FOREIGN KEY (client_id) REFERENCES clients (id)
);