import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkIcon,
  ChatBubbleBottomCenterTextIcon,
  EllipsisVerticalIcon,
  GiftIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import TimeAgo from "react-timeago";
import Link from "next/link";
import { Jelly } from "@uiball/loaders";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast'
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_VOTES_BY_POST_ID } from "../graphql/queries";
import { ADD_VOTE } from "../graphql/mutations";

type Props = {
  post: Post;
};

const Post = ({ post }: Props) => {
    const {data: session} = useSession()
    const [vote, setVote] = React.useState<boolean>()
    const {data, loading} = useQuery(GET_ALL_VOTES_BY_POST_ID, {
        variables: {
            post_id: post?.id
        }
    })


    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [GET_ALL_VOTES_BY_POST_ID, 'getVoteUsingVote_post_id_fkey']
    })

    React.useEffect(() => {
        const votes: Vote[] = data?.getVoteUsingVote_post_id_fkey

        const vote = votes?.find(
          (vote) => vote.username === session?.user?.name
        )?.upvote;

        

        setVote(vote)
    }, [data])

    const upVote = async (isUpvote: boolean) => {
      if (!session) {
        toast("❗️ You'll need to sign in to Vote");
        return;
      }

      if(vote && isUpvote) return
      if(vote == false && !isUpvote) return


      const {
        data: { insertVote: newVote },
      } = await addVote({
        variables: {
          post_id: post.id,
          username: session?.user?.name,
          upvote: isUpvote,
        },
      });
    }

  if (!post)
    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <Jelly size={50} color="#FF4501" />
      </div>
    );

    // console.log(vote)

  return (
    <Link href={`/post/${post.id}`}>
      <div className="flex cursor-pointer rounded-md border border-gray-300 bg-white shadow-sm hover:border hover:border-gray-600 mt-4">
        {/* Votes */}
        <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-gray-50 p-4 text-gray-400">
          <ArrowUpIcon className={`voteButtons hover:text-red-400 ${vote && 'text-red-400'}`} />
          <p className="text-xs font-bold text-black">0</p>
          <ArrowDownIcon className={`voteButtons hover:text-blue-400 ${vote == false && 'text-blue-400'}`} />
        </div>

        <div className="p-3 pb-1">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Avatar seed={post.subreddit[0].topic} />
            <p className="text-xs text-gray-400">
              <Link href={`/subreddit/${post.subreddit[0]?.topic}`}>
                <span className="font-bold text-black hover:text-blue-400">
                  r/{post.subreddit[0]?.topic}{" "}
                </span>
              </Link>
              • Posted by u/{post.username} <TimeAgo date={post.created_at} />
            </p>
          </div>

          {/* Body */}
          <div className="py-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm font-light">{post.body}</p>
          </div>

          {/* Image */}
          <img className="w-full" src={post.image} alt="" />

          {/* Footer */}
          <div className="flex space-x-4 text-gray-400">
            <div className="postButtons">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
              <p className="">
                {post.comment.length}{" "}
                {post.comment.length == 1 ? "Comment" : "Comments"}
              </p>
            </div>
            <div className="postButtons">
              <GiftIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Award</p>
            </div>
            <div className="postButtons">
              <ShareIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Share</p>
            </div>
            <div className="postButtons">
              <BookmarkIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Save</p>
            </div>
            <div className="postButtons">
              <EllipsisVerticalIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Post;
