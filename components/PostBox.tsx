import { useSession } from "next-auth/react";
import React from "react";
import Avatar from "./Avatar";
import { PhotoIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import {ADD_POST, ADD_SUBREDDIT} from "../graphql/mutations"
import client from "../apollo-client";
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from "../graphql/queries";
import { toast } from "react-hot-toast";

type FormData = {
  postTitle: string
  postBody: string
  postImage: string
  subreddit: string
};

type Props = {
  subreddit?: string
}

const PostBox = ({subreddit}: Props) => {
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [GET_ALL_POSTS, "getPostList"],
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT)

  const [imageBoxOpen, setImageBoxOpen] = React.useState<boolean>(false)
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData)

    const notification = toast.loading('Creating a new post...')

    try {
        const {
          data: { getSubredditListByTopic },
        } = await client.query({
          query: GET_SUBREDDIT_BY_TOPIC,
          variables: {
            topic: formData.subreddit,
          },
        });

        const subredditExists = getSubredditListByTopic.length > 0;

        if(!subredditExists) {
            console.log('Subreddit is new! -> creating a NEW subreddit')
            const {data: {insertSubreddit: newSubreddit}} = await addSubreddit({
                variables: {
                    topic: subreddit || formData.subreddit
                }
            })

            console.log('Creating post...', formData)
            const image = formData.postImage || ''

            const {data: {insertPost: newPost}} = await addPost({
                variables: {
                    body: formData.postBody,
                    image: image,
                    subreddit_id: newSubreddit.id,
                    title: formData.postTitle,
                    username: session?.user?.name
                }
            })

            console.log('New post added', newPost)
        } else {
            console.log('Using existing subreddit')
            console.log(getSubredditListByTopic)

            const image = formData.postImage || ''

            const {
              data: { insertPost: newPost },
            } = await addPost({
              variables: {
                body: formData.postBody,
                image: image,
                subreddit_id: getSubredditListByTopic[0].id,
                title: formData.postTitle,
                username: session?.user?.name,
              },
            });

            console.log('New post added', newPost)
        }

        setValue('postBody', '')
        setValue('postImage', '')
        setValue('postTitle', '')
        setValue('subreddit', '')
        toast.success('New Post Created!', {
          id: notification,
        })
    } catch(error) {
      toast.error('Something went wrong', {
        id: notification
      })
      console.log(error)
    }
  })

  return (
    <form
      className="sticky top-20 z-500 bg-white border rounded-md border-gray-300 p-2"
      onSubmit={onSubmit}
    >
      <div className="flex items-center space-x-3">
        <Avatar />

        <input
          {...register("postTitle", { required: true })}
          type="text"
          placeholder={
            session
              ? subreddit
                ? `Create a post in r/${subreddit}`
                : "Create a post by entering a title"
              : "Sign in to post"
          }
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
        />

        <PhotoIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 text-gray-300 cursor-pointer ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>

      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              {...register("postBody")}
              type="text"
              placeholder="Text (optional)"
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
            />
          </div>

          {!subreddit && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Subreddit:</p>
              <input
                {...register("subreddit", { required: true })}
                type="text"
                placeholder="i.e. reactjs"
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              />
            </div>
          )}

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                {...register("postImage")}
                type="text"
                placeholder="Optional..."
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              />
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle?.type === "required" && (
                <p>- A Post Title is required</p>
              )}

              {errors.subreddit?.type === "required" && (
                <p>- A Subreddit is required</p>
              )}
            </div>
          )}

          {watch("postTitle") && (
            <button
              type="submit"
              className="w-full rounded-full bg-blue-400 p-2 text-white"
            >
              Create Post
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default PostBox;
