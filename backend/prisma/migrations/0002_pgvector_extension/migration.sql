CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "artifact_chunks"
  ALTER COLUMN "embedding" TYPE vector(1536)
  USING "embedding"::vector(1536);

CREATE INDEX IF NOT EXISTS "artifact_chunks_embedding_hnsw_idx"
  ON "artifact_chunks"
  USING hnsw ("embedding" vector_cosine_ops);