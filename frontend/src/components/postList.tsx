import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define the structure of a post object
interface PostType {
    _id: string;
    user: string;
    content: string;
    image?: string; // Optional, since not all posts may have an image
}

// Define the props for the Post component
interface PostProps {
    post: PostType;
    deletePost: (id: string) => void;
}

const Post: React.FC<PostProps> = ({ post, deletePost }) => {
    return (
        <tr>
            <td>{post.user}</td>
            <td>{post.content}</td>
            <td>
                {post.image && (
                    <img
                        src={`data:image/jpeg;base64,${post.image}`}
                        alt="Post Image"
                        style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover" }}
                    />
                )}
            </td>
            <td>
                <Link to={'/edit/${post._id}'} className="btn btn-primary">Edit</Link>
                <button className="btn btn-link" onClick={() => deletePost(post._id)}>
                    Delete
                </button>
            </td>
        </tr>
    );
};

const PostList: React.FC = () => {
    const [posts, setPosts] = useState<PostType[]>([]); // Posts are an array of PostType

    useEffect(() => {
        async function getPosts() {
            try {
                const response = await fetch("https://localhost:3001/posts");

                if (!response.ok) {
                    const message = `An error has occurred: ${response.statusText}`;
                    window.alert(message);
                    return;
                }

                const posts: PostType[] = await response.json(); // Specify the type of the data you're expecting
                setPosts(posts);
            } catch (error) {
                window.alert("An error occurred while fetching posts.");
            }
        }

        getPosts();
    }, []);

    const deletePost = async (id: string) => {
        const token = localStorage.getItem("jwt");
        try {
            await fetch(`https://localhost:3001/posts/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const newPosts = posts.filter((post) => post._id !== id);
            setPosts(newPosts);
        } catch (error) {
            window.alert("An error occurred while deleting the post.");
        }
    };

    const renderPosts = () => {
        return posts.map((post) => (
            <Post 
                post={post}
                deletePost={deletePost}
                key={post._id}
            />
        ));
    };
    
    return (
        <div>
            <div className="container">
                <h3 className="header">APDS Notice Board</h3>
                <table className="table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Caption</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>{renderPosts()}</tbody>
                </table>
            </div>
        </div>
    );
};

export default PostList;
