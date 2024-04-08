import React, { useEffect, useState } from "react";

function Github() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/ashish-codejourney"
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error("Failed to fetch GitHub data");
        }
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full border-t-4 border-black-900 border-opacity-75 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">

      <div className="flex items-center justify-center">
        <img
          src={data.avatar_url}
          alt={`${data.login}'s Avatar`}
          className="rounded-full border-4 border-gray-600"
          width={150}
        />
      </div>

      <div className="mt-4">
        <p className="text-center text-xl font-bold">{data.name}</p>
        <p className="text-center text-gray-500">@{data.login}</p>
        <p className="text-center mt-2">{data.bio}</p>
      </div>

      <div className="text-center mt-4">
        <p className="flex justify-center">
          <img
            src="https://komarev.com/ghpvc/?username=ashish-codejourney&label=Profile%20views&color=0e75b6&style=flat"
            alt="Profile Views"
          />
        </p>
      </div>

      <div className="text-center mt-4">
        <a
          href="https://github.com/ryo-ma/github-profile-trophy"
          className="flex justify-center"
        >
          <img
            src="https://github-profile-trophy.vercel.app/?username=ashish-codejourney"
            alt="GitHub Trophies"
          />
        </a>
      </div>

      <div className="text-center mt-4 flex justify-center">
        <a
          href="https://twitter.com/CLI_Craftsman"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://img.shields.io/twitter/follow/CLI_Craftsman?logo=twitter&style=for-the-badge"
            alt="Twitter Followers"
          />
        </a>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-2 gap-4 mx-auto max-w-2xl">
          <div>
            <p className="text-center text-lg font-bold">Top Languages</p>
            <img
              src={`https://github-readme-stats.vercel.app/api/top-langs?username=${data.login}&show_icons=true&locale=en&layout=compact`}
              alt={`${data.login}'s Top Languages`}
            />
          </div>
          <div>
            <p className="text-center text-lg font-bold">GitHub Stats</p>
            <img
              src={`https://github-readme-stats.vercel.app/api?username=${data.login}&show_icons=true&locale=en`}
              alt={`${data.login}'s GitHub Stats`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Github;