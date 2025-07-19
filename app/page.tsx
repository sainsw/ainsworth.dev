import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import ViewCounter from 'app/blog/view-counter';
import { PreloadResources } from 'app/preload';
import { ArrowIcon } from './components/arrow-icon';
import { PrideAvatar } from './components/pride-avatar';
import { Icon } from '../components/icon';

function Badge(props) {
  return (
    <a
      {...props}
      target="_blank"
      className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded p-1 text-sm inline-flex items-center leading-4 text-neutral-900 dark:text-neutral-100 no-underline"
    />
  );
}



export default function Page() {
  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">hello, I'm Sam 👋</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          I like to keep things simple and practical.
        </p>
      </div>
      <p className="prose prose-neutral dark:prose-invert">
        {`I'm a Senior Full Stack Engineer with 8+ years of experience in full-stack development and cloud solutions. I currently `}
        <Link href="/work">work</Link>
        {` at `}
        <span className="not-prose">
          <Badge href="https://www.ibm.com">
            <svg
              width="14"
              height="14"
              role="img"
              aria-label="IBM logo"
              className="!mr-1"
              viewBox="0 0 58 23"
              fill="currentColor"
            >
              <path d="M58,21.4666667 L58,23 L50.3684211,23 L50.3684211,21.4666667 L58,21.4666667 Z M39.6842105,21.4666667 L39.6842105,23 L32.0526316,23 L32.0526316,21.4666667 L39.6842105,21.4666667 Z M45.6385329,21.4666667 L45.0245693,23 L44.41871,21.4666667 L45.6385329,21.4666667 Z M28.5421053,21.4666667 C27.4471432,22.4188667 26.0029202,23 24.3905263,23 L24.3905263,23 L12.2105263,23 L12.2105263,21.4666667 Z M10.6842105,21.4666667 L10.6842105,23 L0,23 L0,21.4666667 L10.6842105,21.4666667 Z M39.6842105,18.4 L39.6842105,19.9333333 L32.0526316,19.9333333 L32.0526316,18.4 L39.6842105,18.4 Z M46.8318522,18.4 L46.2377311,19.9333333 L43.8212353,19.9333333 L43.2226426,18.4 L46.8318522,18.4 Z M30.0684211,18.4 C29.9306437,18.9451697 29.7105614,19.4599515 29.4273684,19.9333333 L29.4273684,19.9333333 L12.2105263,19.9333333 L12.2105263,18.4 Z M10.6842105,18.4 L10.6842105,19.9333333 L0,19.9333333 L0,18.4 L10.6842105,18.4 Z M58,18.4 L58,19.9333333 L50.3684211,19.9333333 L50.3684211,18.4 L58,18.4 Z M54.9473684,15.3333333 L54.9473684,16.8666667 L50.3684211,16.8666667 L50.3684211,15.3333333 L54.9473684,15.3333333 Z M39.6842105,15.3333333 L39.6842105,16.8666667 L35.1052632,16.8666667 L35.1052632,15.3333333 L39.6842105,15.3333333 Z M48.0292704,15.3333333 L47.4295831,16.8666667 L42.6233978,16.8666667 L42.019006,15.3333333 L48.0292704,15.3333333 Z M29.8547368,15.3333333 C29.991899,15.8221879 30.0684211,16.3357152 30.0684211,16.8666667 L30.0684211,16.8666667 L24.4210526,16.8666667 L24.4210526,15.3333333 Z M19.8421053,15.3333333 L19.8421053,16.8666667 L15.2631579,16.8666667 L15.2631579,15.3333333 L19.8421053,15.3333333 Z M7.63157895,15.3333333 L7.63157895,16.8666667 L3.05263158,16.8666667 L3.05263158,15.3333333 L7.63157895,15.3333333 Z M54.9473684,12.2666667 L54.9473684,13.8 L50.3684211,13.8 L50.3684211,12.2666667 L54.9473684,12.2666667 Z M39.6842105,12.2666667 L39.6842105,13.8 L35.1052632,13.8 L35.1052632,12.2666667 L39.6842105,12.2666667 Z M49.2252679,12.2666667 L48.6284686,13.8 L41.4089474,13.8 L40.8168134,12.2666667 L49.2252679,12.2666667 Z M27.9773684,12.2666667 C28.5037637,12.6994848 28.9570701,13.2181697 29.3052632,13.8 L29.3052632,13.8 L15.2631579,13.8 L15.2631579,12.2666667 Z M7.63157895,12.2666667 L7.63157895,13.8 L3.05263158,13.8 L3.05263158,12.2666667 L7.63157895,12.2666667 Z M44.5987396,9.2 L45.0263158,10.4393515 L45.4535426,9.2 L54.9473684,9.2 L54.9473684,10.7333333 L50.3684211,10.7333333 L50.3684211,9.32433939 L49.8494737,10.7333333 L40.1878947,10.7333333 L39.6842105,9.3242 L39.6842105,10.7333333 L35.1052632,10.7333333 L35.1052632,9.2 L44.5987396,9.2 Z M7.63157895,9.2 L7.63157895,10.7333333 L3.05263158,10.7333333 L3.05263158,9.2 L7.63157895,9.2 Z M29.3052632,9.2 C28.9570701,9.7818303 28.5037637,10.3003758 27.9773684,10.7333333 L27.9773684,10.7333333 L15.2631579,10.7333333 L15.2631579,9.2 Z M54.9473684,6.13333333 L54.9473684,7.66666667 L45.9831118,7.66666667 L46.5234001,6.13333333 L54.9473684,6.13333333 Z M43.534302,6.13333333 L44.0745993,7.66666667 L35.1052632,7.66666667 L35.1052632,6.13333333 L43.534302,6.13333333 Z M30.0684211,6.13333333 C30.0684211,6.66414545 29.991899,7.17767273 29.8547368,7.66666667 L29.8547368,7.66666667 L24.4210526,7.66666667 L24.4210526,6.13333333 Z M19.8421053,6.13333333 L19.8421053,7.66666667 L15.2631579,7.66666667 L15.2631579,6.13333333 L19.8421053,6.13333333 Z M7.63157895,6.13333333 L7.63157895,7.66666667 L3.05263158,7.66666667 L3.05263158,6.13333333 L7.63157895,6.13333333 Z M42.4774196,3.06666667 L43.0079113,4.6 L32.0527757,4.6 L32.0526316,3.06666667 L42.4774196,3.06666667 Z M58,3.06666667 L58,4.6 L47.0390632,4.6 L47.5903678,3.06666667 L58,3.06666667 Z M29.4273684,3.06666667 C29.7105614,3.54004848 29.9306437,4.0548303 30.0684211,4.6 L30.0684211,4.6 L12.2105263,4.6 L12.2105263,3.06666667 Z M10.6842105,3.06666667 L10.6842105,4.6 L0,4.6 L0,3.06666667 L10.6842105,3.06666667 Z M41.4056725,0 L41.9462722,1.53333333 L32.05278,1.53333333 L32.0526316,0 L41.4056725,0 Z M58,0 L58,1.53333333 L48.1188427,1.53333333 L48.6466706,0 L58,0 Z M24.3905263,0 C25.9912083,0 27.4472798,0.581133333 28.5421053,1.53333333 L28.5421053,1.53333333 L12.2105263,1.53333333 L12.2105263,0 Z M10.6842105,0 L10.6842105,1.53333333 L0,1.53333333 L0,0 L10.6842105,0 Z"/>
            </svg>
            IBM
          </Badge>
        </span>
        {` in Manchester, where I focus on enterprise software development and cloud architecture with `}
        <span className="not-prose">
          <Badge href="https://react.dev">
            <Icon id="react" size={14} className="!mr-1" />
            React
          </Badge>
        </span>
        {`, `}
        <span className="not-prose">
          <Badge href="https://dotnet.microsoft.com">
            <Icon id="dotnet" size={14} className="!mr-1" />
            .NET
          </Badge>
        </span>
        {`, and `}
        <span className="not-prose">
          <Badge href="https://azure.microsoft.com">
            <Icon id="azure" size={14} className="!mr-1" />
            Azure
          </Badge>
        </span>
        .
      </p>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          I'm passionate about enterprise design thinking and building scalable, reliable software solutions. 
          On my <Link href="/blog">blog</Link>, I share insights about software development, cloud technologies, .NET, Azure, and the latest in enterprise software architecture.
          You'll find content that reflects my experience in leading development teams and implementing modern software practices.
        </p>
      </div>
      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/samainsworth/"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">linkedin</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            href="/contact"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">get in touch</p>
          </a>
        </li>
      </ul>
      <div className="container px-4 mx-auto">
        <div className="pt-24 pb-11 mx-auto max-w-4xl">
          <a className="block md:mx-auto mb-5 max-w-max" aria-label="find me on linkedin" href="https://www.linkedin.com/in/samainsworth/">
            <PrideAvatar>
              <picture>
                <source srcSet="/images/home/avatar.webp" type="image/webp" />
                <img 
                  className="bg-left-bottom h-20 w-20 rounded-full" 
                  src="/images/home/avatar.jpg" 
                  alt="my face"
                  width={80}
                  height={80}
                  loading="eager"
                />
              </picture>
            </PrideAvatar>
          </a>
        </div>
      </div>
    </section>
  );
}
