CREATE TABLE IF NOT EXISTS message_feedback (
  id BIGSERIAL PRIMARY KEY,
    message_id int not null,
    foreign key (message_id) references messages(id) on delete cascade,
  rating BOOLEAN NOT NULL,
  additional_feedback TEXT
)
