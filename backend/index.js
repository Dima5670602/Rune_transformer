const express = require("express")
const crypto = require("crypto")
const cors = require("cors")

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())
app.use(cors())

// Caractères Unicode pour les Runes
const runes = ['█', '▓', '▒', '░', '▀', '▄', '▌', '▐', '▉', '▊', '▋', '▍', '▎', '▏', '▔', '▕']

// Fonction de génération des runes
function generateRune(text) {
    if (!text || text.trim() === "") {
        return { error: "Texte vide" }
    }

    // Création d'un hash basé sur le texte
    const hash = crypto.createHash("md5").update(text).digest("hex")
    const hashint = parseInt(hash.substring(0, 8), 16)

    let rune = ""
    for (let i = 0; i < 9; i++) {
        const runesIndex = (Math.abs(hashint >> (i * 2))) % runes.length
        rune += runes[runesIndex]
        if ((i + 1) % 3 === 0 && i < 8) {
            rune += "\n" // saut de ligne tous les 3 caractères
        }
    }

    return {
        success: true,
        rune: rune,
        text: text,
        hash: hash.substring(0, 8)
    }
}

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Générateur de rune",
        usage: 'POST /generate avec {"text":"votre texte"}'
    })
})

app.post("/generate", (req, res) => {
    const { text } = req.body
    if (!text) {
        return res.status(400).json({ error: "champ vide" })
    }
    const result = generateRune(text)
    res.json(result)
})

app.post("/batch", (req, res) => {
    const { texts } = req.body
    if (!Array.isArray(texts)) {
        return res.status(400).json({ error: "Le texte doit être un tableau" })
    }
    if (texts.length > 50) {
        return res.status(400).json({ error: "50 mots maximum" })
    }
    const result = texts.map(t => generateRune(t))
    res.json({
        success: true,
        runes: result,
        total: result.length
    })
})

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`)
})
