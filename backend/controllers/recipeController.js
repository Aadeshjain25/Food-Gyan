const driver = require('../config/db')

const createRecipe = async(req, res) => {
    const { title, ingredients, instructions, calories, protein, allergens } = req.body;
    const userEmail = req.user.email
    const session = driver.session()

    try {
        const result = await session.run(`
            MATCH (u:User {email: $email})
            CREATE (r: Recipe{
                title: $title,
                ingredients: $ingredients,
                instructions: $instructions,
                calories: $calories,
                protein: $protein,
                allergens: $allergens
            })
                CREATE (u)-[:CREATED]->(r)
                RETURN r
            `, {
            email: userEmail,
            title,
            ingredients,
            instructions,
            calories: Number(calories),
            protein: Number(protein),
            allergens
        })
        const recipe = result.records[0].get("r").properties
        res.status(201).json({ message: "Recipe Created", recipe })
    } catch (err) {
        console.log("Create recipe error", err)
        res.status(500).json({ error: "Failed to create recipe" })
    } finally {
        await session.close()
    }
}
const getRecipes = async(req, res) => {
    const session = driver.session()
    const userEmail = req.user.email
    try {
        const result = await session.run(`
            MATCH (u:User {email : $email})-[:CREATED]->(r: Recipe)
            RETURN id(r) AS id, r
            `, { email: userEmail })
        if (result.records.length === 0) {
            return res.status(404).json({ error: "No recipes found" });
        }
        const recipes = result.records.map(record => {
            const recipe = record.get('r').properties;
            const id = record.get('id').toNumber();
            return { id, ...recipe };
        });
        res.status(200).json({ recipes })
    } catch (err) {
        console.log("Get recipes error", err)
        res.status(500).json({ error: "Failed to get recipes" })
    } finally {
        await session.close()
    }
}
const updateRecipes = async(req, res) => {
    const { title } = req.params
    const { ingredients, instructions, calories, protein, allergens } = req.body
    const userEmail = req.user.email
    const session = driver.session()
    try {
        const result = await session.run(`
        MATCH(u:User {email : $email}) - [:CREATED]->(r : Recipe {title : $title})
        SET r.ingredients = $ingredients,
            r.instructions = $instructions,
            r.calories = $calories,
            r.protein = $protein,
            r.allergens = $allergens
            RETURN r
        `, {
            email: userEmail,
            title,
            ingredients,
            instructions,
            calories: Number(calories),
            protein: Number(protein),
            allergens: allergens
        })
        if (result.records.length === 0) {
            return res.status(404).json({ error: "Recipe not found" })
        }
        const updated = result.records[0].get('r').properties
        res.json({ message: "Recipe Updated", recipe: updated })
    } catch (err) {
        console.log("Update recipe error", err);
        res.status(500).json({ error: "Failed to update recipe" });
    } finally {
        await session.close();
    }

}
const deleteRecipes = async(req, res) => {
    const { title } = req.params;
    const userEmail = req.user.email;
    const session = driver.session();

    try {
        const result = await session.run(`
            MATCH (u:User {email: $email})-[:CREATED]->(r:Recipe {title: $title})
            DETACH DELETE r
        `, { email: userEmail, title });

        res.json({ message: "Recipe deleted successfully" });
    } catch (err) {
        console.log("Delete recipe error", err);
        res.status(500).json({ error: "Failed to delete recipe" });
    } finally {
        await session.close();
    }

}
module.exports = { createRecipe, getRecipes, updateRecipes, deleteRecipes }