-- CreateTable: User
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL
);

-- CreateTable: Profile
CREATE TABLE "Profile" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "userId" INTEGER NOT NULL UNIQUE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: Post
CREATE TABLE "Post" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "authorId" INTEGER NOT NULL,
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: Category
CREATE TABLE "Category" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

-- CreateTable: CategoriesOnPosts (Join Table)
CREATE TABLE "CategoriesOnPosts" (
  "postId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "assignedBy" TEXT NOT NULL,
  PRIMARY KEY ("postId", "categoryId"),
  FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
