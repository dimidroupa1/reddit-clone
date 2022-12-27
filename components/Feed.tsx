import { useQuery } from '@apollo/client'
import React from 'react'
import { GET_ALL_POSTS, GET_ALL_POSTS_BY_TOPIC } from '../graphql/queries'
import Post from './Post';

type Props = {
    topic?: string
}

const Feed = ({topic}: Props) => {
  const { data, error } = !topic
    ? useQuery(GET_ALL_POSTS)
    : useQuery(GET_ALL_POSTS_BY_TOPIC, {
        variables: {
          topic: topic,
        },
      });

  const post: Post[] = !topic ? data?.getPostList : data?.getPostListByTopic;

  return (
    <div className='space-y-4'>
        {post?.map((post) => 
            <Post key={post.id} post={post}/>    
        )}
    </div>
);
}

export default Feed