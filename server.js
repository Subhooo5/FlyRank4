import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const port = process.env.PORT || 3000

app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body
    if(!email || !password) {
        return res.status(400).json({error : "Email and Password are required"})
    } 

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
        return res.status(400).json({ error: error.message })
    }
    res.status(201).json(data.user)
}) 

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    if(!email || !password) {
        return res.status(400).json({error : "Email and Password are required"})
    } 

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        return res.status(401).json({ error: 'Invalid login credentials' })
    }
    res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
    })
})

app.listen(port, () => {
  console.log(`Server running and connected to Supabase on port ${port}`)
})