import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const port = process.env.PORT || 3000



app.listen(port, () => {
  console.log(`Server running and connected to Supabase on port ${port}`)
})