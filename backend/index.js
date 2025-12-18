import express from "express"
import dotenv from "dotenv"
import path from "path"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const __dirname = path.resolve()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

app.get("/api", (req, res) => {
  res.send("Hi")
})

if (process.env.NODE_ENV === "production"||true) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  // SPA fallback — MUST be RegExp
  app.get(/.*/, (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend/dist/index.html")
    )
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
