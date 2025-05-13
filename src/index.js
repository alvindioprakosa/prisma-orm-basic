import express from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utility: async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// ==========================
// 📦 USER ROUTES
// ==========================
const userRouter = express.Router();

userRouter.post("/", asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.create({ data: { username, password } });
  res.json(user);
}));

userRouter.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { username, password },
  });
  res.json(user);
}));

userRouter.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.delete({ where: { id: Number(id) } });
  res.json(user);
}));

userRouter.get("/", asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: { Profile: true, Post: true },
  });
  res.json(users);
}));

// ==========================
// 👤 PROFILE ROUTES
// ==========================
const profileRouter = express.Router();

profileRouter.post("/", asyncHandler(async (req, res) => {
  const { email, name, address, phone, userId } = req.body;
  const profile = await prisma.profile.create({
    data: { email, name, address, phone, userId },
  });
  res.json(profile);
}));

profileRouter.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await prisma.profile.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
  res.json(profile);
}));

// ==========================
// 📝 POST ROUTES
// ==========================
const postRouter = express.Router();

postRouter.post("/", asyncHandler(async (req, res) => {
  const { title, content, published, authorId } = req.body;
  const post = await prisma.post.create({
    data: { title, content, published, authorId },
  });
  res.json(post);
}));

postRouter.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: true,
      CategoriesOnPosts: {
        include: { category: true }
      }
    }
  });
  res.json(post);
}));

postRouter.post("/insert", asyncHandler(async (req, res) => {
  const { title, content, published, authorId, categoryId, assignedBy } = req.body;

  const post = await prisma.$transaction(async (tx) => {
    const createdPost = await tx.post.create({
      data: { title, content, published, authorId },
    });

    await tx.categoriesOnPosts.create({
      data: {
        postId: createdPost.id,
        categoryId,
        assignedBy,
      },
    });

    return createdPost;
  });

  res.json(post);
}));

// ==========================
// 🏷️ CATEGORY ROUTES
// ==========================
const categoryRouter = express.Router();

categoryRouter.post("/", asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.json(category);
}));

categoryRouter.get("/", asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        include: {
          post: true
        }
      }
    }
  });
  res.json(categories);
}));

// ==========================
// 🔗 REGISTER ROUTES
// ==========================
app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/post", postRouter);
app.use("/category", categoryRouter);

// ==========================
// ❗ GLOBAL ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ==========================
// 🚀 START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
