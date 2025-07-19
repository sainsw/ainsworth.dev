"use client";
import Link from 'next/link';
import { ArrowIcon } from '../components/arrow-icon';
import { Icon } from '../components/icon';


const education = [
  {
    index: 1,
    name: 'University of Liverpool, UK',
    dates: '2013 - 2016',
    qual: 'Computer Science BSc - 2:1',
    description: ['For my undergraduate dissertation, 'Accelerometer Games for the iOS Platform', I created a physics–based game for iPhone and iPad. This was a great opportunity to learn Swift and SpriteKit, along with the App Store submission process. ',
      'The project was well–received, with the University choosing to use my game as a learning tool and as an example of an exceptional final project during open days.'],
    iconId: "uol",
    url: "https://www.liverpool.ac.uk/"
  },
  {
    index: 2,
    name: 'Ashton Sixth Form College, UK',
    dates: '2011 - 2013',
    qual: 'Computing, Physics, Maths A-Levels',
    iconId: "asfc",
    url: "https://www.asfc.ac.uk/"
  },
  {
    index: 3,
    name: 'West Hill High School, UK',
    dates: '2006 - 2011',
    iconId: "westhill",
    url: "https://www.westhillschool.co.uk/"
  },
]

const work = [
  {
    name: 'IBM',
    dates: '2025 - Present',
    position: 'Senior Full Stack Engineer',
    description: ['In my current role at IBM, I focus on enterprise software development and cloud architecture solutions. I work with cutting-edge technologies to build scalable, reliable software systems that serve enterprise clients globally.',
                  'My responsibilities include applying enterprise design thinking principles, developing cloud-native applications, and implementing modern software architecture patterns. I leverage Azure cloud services, .NET Core, and various enterprise technologies to deliver robust solutions.',
                  'I hold multiple certifications including Enterprise Design Thinking Practitioner and Azure Fundamentals, reflecting my commitment to staying current with industry best practices and emerging technologies.'],
    iconId: "ibm",
    url: "https://www.ibm.com/"
  },
  {
    name: 'musicMagpie',
    dates: '2020 - 2025',
    position: 'Senior Software Engineer',
    description: ['In this role, I evolved from a mid-level software engineer to a senior developer and team lead. I went from helping to rebuild and improve the company\'s website, to leading a team of front and back-end developers. I leveraged Azure, Terraform, ASP.NET, and more, and helped to orchestrate the integration of IdentityServer4, driving measurable improvements in load times and customer conversion.',
                  'As a senior developer, I guided a team of five through Scrum methodology while continuously researching and implementing cutting-edge technologies to optimise workflows and elevate performance. I worked hard to foster a collaborative environment in which everyone could demonstrate their strengths. Through this, my team successfully overhauled multi-national customer facing applications in React and Typescript, and moved to .Net Core RESTful APIs, Service Bus architecture and NoSQL data warehousing.',
                  'This role expanded not only my technical expertise but also essential leadership, communication, and problem-solving skills, driving the company\'s overall success and customer satisfaction.'],
    iconId: "musicmagpie",
    url: "https://www.musicmagpie.co.uk/"
  },
  {
    name: 'Bott & Company Solicitors',
    dates: '2016 - 2020',
    position: 'C# Software Developer',
    description: ['At this consumer-focused firm of solicitors, efficient, user-friendly software played a crucial role in day-to-day operations. My role was to replace system components with best practices and MVC3 under C#, to design and maintain ASP.Net Web Apps and APIs with MSSQL back-end, to implement SSRS reports and TSQL Stored Procedures, and to oversee and expand legal-specific case management systems.',
                  'Through my guidance and expertise, the business adopted industry-standard tools including Git and Jira. I also led exploratory research projects into Azure, and contributed to upgrading data warehouse security to the ISO-27001 standard.'],
    iconId: "bott",
    url: "https://www.bottonline.co.uk/"
  },
  {
    name: 'WHSmith',
    dates: '2012 - 2016',
    position: 'Sales Assistant',
    iconId: "whsmith",
    url: "https://www.whsmith.co.uk/"
  }
]

function ExperienceCard({ name, dates, post, description, iconId, url }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded px-3 py-4 w-full grid grid-cols-[auto,1fr] gap-4">
      <div className="flex flex-col">
        <p className="prose-medium text-neutral-900 dark:text-neutral-100">
          {name}
        </p>
        <p className="prose-sm mt-2 italic text-neutral-900 dark:text-neutral-100">
          {post}
        </p>
        <p className="prose-sm text-neutral-900 dark:text-neutral-100">
          {dates}
        </p>
      </div>
      <div className="flex flex-col">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 self-end">
            <Icon id={iconId} size={48} className="h-12 w-12" />
          </a>
        ) : (
          <Icon id={iconId} size={48} className="h-12 w-12 self-end" />
        )}
      </div>
      {description && (
        <div className="col-span-2">
          {description.map((desc, index) => (
            <Paragraph key={index} str={desc} />
          ))}
        </div>
      )}
    </div>
  );
}


function Paragraph({ key, str }) {
  return (
    <p key={key} className="prose-sm mt-2 text-neutral-900 dark:text-neutral-100">
      {str}
    </p>
  );
}

export default function Page() {
  return (
    <section>
      <div>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">work 👨‍💻</h1>
        <ul>
          {work.map((job, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={job.name}
              dates={job.dates}
              post={job.position}
              description={job.description}
              iconId={job.iconId}
              url={job.url}
            />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h1 className="font-medium text-2xl mb-8 mt-12 tracking-tighter">education 👨‍🎓</h1>
        <ul>
          {education.map((school, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={school.name}
              dates={school.dates}
              post={school.qual}
              description={school.description}
              iconId={school.iconId}
              url={school.url}
            />
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="/files/cv.pdf"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">Open PDF Version</p>
          </a>
        </li>
      </ul>
    </section>
  );
}

