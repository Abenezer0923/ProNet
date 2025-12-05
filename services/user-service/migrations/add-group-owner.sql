-- Add ownerId column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS "ownerId" uuid;

-- Add foreign key constraint
ALTER TABLE groups 
ADD CONSTRAINT "FK_groups_owner" 
FOREIGN KEY ("ownerId") 
REFERENCES users(id) 
ON DELETE SET NULL;

-- Set existing groups' owner to the community creator
UPDATE groups g
SET "ownerId" = c."createdBy"
FROM communities c
WHERE g."communityId" = c.id
AND g."ownerId" IS NULL;
