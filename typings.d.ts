type Commect = {
  created_at: string
  id: number
  post_id: number
  text: string
  username: string
}

type Subreddit = {
  created_at: string
  id: number
  topic: string
}

type Vote = {
  created_at: string
  id: number
  post_id: number
  upvote: boolean
  username: string
}

type Post = {
  body: string
  comment: Commect[]
  created_at: string
  id: number
  image: string
  subreddit: Subreddit[]
  subreddit_id: number
  title: string
  username: string
  vote: Vote[]
}
  
