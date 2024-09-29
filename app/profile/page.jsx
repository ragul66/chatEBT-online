"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Profile from "@components/Profile";

const MyProfile = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setposts] = useState([]);

  //Fetch postst for the specific users
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${session?.user.id}/posts`);
      const data = await response.json();

      setposts(data); // Set the fetched posts
    };

    if (session?.user.id) fetchPosts();
  }, []);

  const handleEdit = (post) => {
    router.push(`/update-prompt?id=${post._id}`);
  };

  const handleDelete = async (post) => {
    const hasConfirmed = confirm(
      "Are you sure you want to delete this prompt?"
    );

    if (hasConfirmed) {
      try {
        const response = await fetch(`/api/prompt/${post._id}`, {
          method: "DELETE",
        });

        console.log(post._id); // Log the ID to ensure it's valid

        if (response.ok) {
          // Filter out the deleted post from the state
          const filteredPosts = posts.filter((p) => p._id !== post._id);
          setPosts(filteredPosts); // Assuming you have a setPosts state function
        } else {
          const errorText = await response.text(); // Get the response text
          console.error("Failed to delete the post:", errorText); // Log the error message from the server
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <Profile
      name="My"
      desc="Welcome to your Personalized profile Page"
      data={posts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  );
};

export default MyProfile;
