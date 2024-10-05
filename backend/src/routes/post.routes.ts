import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all the records
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = req.app.locals.db.collection("posts");
        const results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (e) {
        console.error("Error fetching posts:", e);
        res.status(500).send({ message: "Failed to retrieve posts" });
    }
});

// Upload a new post
router.post("/upload", async (req: Request, res: Response): Promise<void> => {
    try {
        const newDocument = {
            user: req.body.user,
            content: req.body.content,
            image: req.body.image,
        };

        const collection = req.app.locals.db.collection("posts");
        const result = await collection.insertOne(newDocument);
        res.status(201).send(result);
    } catch (e) {
        console.error("Error uploading post:", e);
        res.status(500).send({ message: "Failed to upload post" });
    }
});

// Update a post by id
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                user: req.body.user,
                content: req.body.content,
                image: req.body.image,
            },
        };

        const collection = req.app.locals.db.collection("posts");
        const result = await collection.updateOne(query, updates);

        if (result.modifiedCount === 0) {
            res.status(404).send({ message: "Post not found or no changes applied" });
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error("Error updating post:", e);
        res.status(500).send({ message: "Failed to update post" });
    }
});

// Get a post by id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = req.app.locals.db.collection("posts");
        const query = { _id: new ObjectId(req.params.id) };
        const result = await collection.findOne(query);

        if (!result) {
            res.status(404).send({ message: "Post not found" });
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error("Error fetching post:", e);
        res.status(500).send({ message: "Failed to retrieve post" });
    }
});

// Delete a post by id
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const collection = req.app.locals.db.collection("posts");
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            res.status(404).send({ message: "Post not found" });
        } else {
            res.status(200).send({ message: "Post deleted successfully" });
        }
    } catch (e) {
        console.error("Error deleting post:", e);
        res.status(500).send({ message: "Failed to delete post" });
    }
});

export default router;
