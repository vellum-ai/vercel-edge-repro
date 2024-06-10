<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="app/assets/logo.svg" alt="TeachingLab.AI Logo" height=80>
  </a>

  <h3 align="center">TeachingLab.AI</h3>

  <p align="center">
    TeachingLab's AI Hub.
    <br />
    <a href="https://www.teachinglab.ai/"><strong>www.teachinglab.ai »</strong></a>
    <br />
    <br />
    <a href="https://supabase.com/dashboard/project/txgpuyxzzbqypeqaptec">Supabase Dashboard</a>
    ·
    <a href="https://vercel.com/teaching-lab/teachinglab-ai">Vercel Dashboard</a>
    ·
    <a href="https://us.posthog.com/project/51987">Posthog Dashboard</a>
  </p>
</div>

![Screenshot 2024-04-26 at 12-45-48 teachinglab ai](https://github.com/podsie/tl.ai/assets/23464391/1d9005d2-5acf-41b9-bf38-f0fa08ce9bc2)


<!-- GETTING STARTED -->
## Local Development

TeachingLab.AI 

### Prerequisites
* [Docker](https://docs.docker.com/get-docker/)
* [Vercel CLI](https://vercel.com/docs/cli)
* [pnpm](https://github.com/pnpm/pnpm)
* [Node 20 (LTS)](https://nodejs.org/en/download/package-manager/current)
 > [!TIP]
 > Using a Node version manager like [fnm](https://github.com/Schniz/fnm) is recommended.


### Initialization
1. Clone the repo
   ```sh
   git clone git@github.com:podsie/tl.ai.gi
   ```
2. Install NPM packages
   ```sh
   pnpm install
   ```
3. Link your project to `teaching-lab/teachinglab-ai` on Vercel
   ```sh
   vercel teams switch teaching-lab
   ﻿vercel link -y -p﻿ teachinglab-ai
   ```
4. Pull development environment variables from Vercel
    ```sh
    vercel env pull .env
    ```
5. Link your project to supabase
    ```sh
     npx supabase link --project-ref txgpuyxzzbqypeqaptec
    ```
   You may leave the database password empty when prompted.
   
6. Start your local supabase containers
    ```sh
    pnpm run supa:start
    ```
    
7. Start your local web server
    ```sh
    pnpm run dev
    ```
   
Then visit your live environment at http://localhost:5173 🚀.

A local supabase dashboard will be available at http://localhost:54323

<p align="right">(<a href="#readme-top">back to top</a>)</p>
# tlai-personal
