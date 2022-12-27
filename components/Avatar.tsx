import { useSession } from 'next-auth/react'
import Image from 'next/image';
import React from 'react'
import Avatar_Logo from "../images/avatar.png"

type Props = {
    seed?: string
    large?: boolean
}

const Avatar = ({seed, large}: Props) => {
  const { data: session } = useSession();

  return (
    <div
      className={`relative h-10 w-10 rounded-full overflow-hidden border-gray-300 bg-white ${
        large && "h-20 w-20"
      }`}
    >
      <Image
        src={`https://avatars.dicebear.com/api/open-peeps/${
          seed || session?.user?.name || "placeholder"
        }.svg`}
        alt={""}
        width={large ? 80 : 40}
        height={large ? 80 : 40}
      />
    </div>
  );
}

export default Avatar