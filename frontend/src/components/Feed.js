import "../App.css";
import axios from "axios";
import { useState } from "react";

const Feed = () => {
  const [feedContent, setFeedContent] = useState();
  const getAtomFeed = async () => {
    try {
      //ENDPOINT FOR RSS FEED GOES HERE!
      const res = await axios.get("http://localhost:4000/", {
        "Content-Type": "application/xml; charset=utf-8",
      });
      console.log(res)

      setFeedContent(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <button type="submit" onClick={getAtomFeed}>
        Fetch ATOM Feed
      </button>
      <div className="feedContainer" style={{ marginTop: 30 }}>
        {feedContent ? <p>{feedContent}</p> : null}
      </div>
    </div>
  );
};

export default Feed;
