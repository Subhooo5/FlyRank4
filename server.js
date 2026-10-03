import express from 'express'
import { createClient } from '@supabase/supabase-js'
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'

const app = express()
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const port = process.env.PORT || 3000

const openapi = JSON.parse(readFileSync('./openapi.json', 'utf-8'))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi))

const authenticate = async (req, res, next) => {
    const header = req.headers.authorization
    if(!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' })
    }

    const token = header.split(' ')[1]
    if(!token) {
        return res.status(401).json({ error: 'Access token required' })
    }

    const { data, error } = await supabase.auth.getUser(token)
    if(error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token '})
    }

    req.user = data.user
    next()
}

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

app.get('/public/info', (req, res) => {
    res.status(200).json({ message: 'Welcome stranger! This info is public.' })
})

app.get('/protected/profile', authenticate, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at
    })
})

app.get('/protected/dashboard', authenticate, (req, res) => {
  res.status(200).json({ message: `Welcome to your dashboard, ${req.user.email}` })
})

app.post('/auth/logout', authenticate, async (req, res) => {
    await supabase.auth.signOut()
    res.status(204).send()
})

app.listen(port, () => {
  console.log(`Server running and connected to Supabase on port ${port}`)
})