import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all the transactions
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = req.app.locals.db.collection("transactions");
        const results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (e) {
        console.error("Error fetching transactions:", e);
        res.status(500).send({ message: "Failed to retrieve transactions" });
    }
});

// Upload a new transaction
router.post("/create", async (req: Request, res: Response): Promise<void> => {
    try {
        const newTransaction = {
            user: req.body.user,
            recipientName: req.body.recipientName,
            recipientBank: req.body.recipientBank,
            accountNumber: req.body.accountNumber,
            amount: req.body.amount,
            swiftCode: req.body.swiftCode,
            transactionDate: new Date(),  // automatically set the date
        };

        const collection = req.app.locals.db.collection("transactions");
        const result = await collection.insertOne(newTransaction);
        res.status(201).send(result);
    } catch (e) {
        console.error("Error uploading transaction:", e);
        res.status(500).send({ message: "Failed to upload transaction" });
    }
});

// Update a transaction by id
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                recipientName: req.body.recipientName,
                recipientBank: req.body.recipientBank,
                accountNumber: req.body.accountNumber,
                amount: req.body.amount,
                swiftCode: req.body.swiftCode,
            },
        };

        const collection = req.app.locals.db.collection("transactions");
        const result = await collection.updateOne(query, updates);

        if (result.modifiedCount === 0) {
            res.status(404).send({ message: "Transaction not found or no changes applied" });
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error("Error updating transaction:", e);
        res.status(500).send({ message: "Failed to update transaction" });
    }
});

// Get a transaction by id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = req.app.locals.db.collection("transactions");
        const query = { _id: new ObjectId(req.params.id) };
        const result = await collection.findOne(query);

        if (!result) {
            res.status(404).send({ message: "Transaction not found" });
        } else {
            res.status(200).send(result);
        }
    } catch (e) {
        console.error("Error fetching transaction:", e);
        res.status(500).send({ message: "Failed to retrieve transaction" });
    }
});

// Delete a transaction by id
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const collection = req.app.locals.db.collection("transactions");
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            res.status(404).send({ message: "Transaction not found" });
        } else {
            res.status(200).send({ message: "Transaction deleted successfully" });
        }
    } catch (e) {
        console.error("Error deleting transaction:", e);
        res.status(500).send({ message: "Failed to delete transaction" });
    }
});

export default router;
