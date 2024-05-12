import { workerData } from "worker_threads";

const education = [
  {
    name: 'University of Liverpool, UK',
    dates: '2013 - 2016',
    qual: 'Computer Science BSc - 2:1',
    image:
      'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Ashton Sixth Form College, UK',
    dates: '2011 - 2013',
    qual: 'Computing, Physics, Maths A-Levels',
    image:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'West Hill High School, UK',
    dates: '2006 - 2011',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

const work = [
  {
    name: 'musicMagpie',
    dates: '2020 - Present',
    position: 'Senior Software Engineer',
    description: 'During my time here, I evolved from a mid-level software engineer to a senior developer, contributing to the rebuilding of our website and then leading a team of front and back-end developers. To start I leveraged Azure, Terraform, ASP.NET, and more, and I helped orchestrate the integration of IdentityServer4 - driving measurable improvements in load times and customer conversion. \nAs a senior software engineer, I fostered a collaborative environment, guiding a team of five through a Scrum methodology while continuously researching and implementing cutting-edge technologies to optimize workflows and elevate performance. With myself, the team has worked to overhaul customer facing applications in React and Typescript, whilst also moving to .Net Core RESTful APIs and NoSQL data warehousing. \nMy role expanded not only technical expertise but also essential soft skills in leadership, communication, and problem-solving, contributing to the company\'s overall success and customer satisfaction.'
  },
  {
    name: 'Bott & Company Solicitors',
    dates: '2016 - 2020',
    position: 'C# Software Developer',
    description: 'A consumer-focused firm of solicitors with a specialisation in leveraging technology for efficiency. This role involved replacing system components with best practices and MVC3 under C# - designing and maintaining ASP.Net Web Apps and APIs with MSSQL back-end, implementing SSRS reports and TSQL Stored Procedures, as well as maintaining and expanding legal-specific case management systems. \nUnder my suggestion the business adopted industry-standard tools like Git and Jira. I also led exploratory research projects into Azure, and contributed to maintaining data warehouse security to ISO-27001 standard.'
  },
  {
    name: 'WHSmith',
    dates: '2012 - 2016',
    position: 'Sales Assistant'
  }
]

function ExperienceCard({ name, dates, post, description }) {
  return (
    <div className="group py-2">
      <div
        className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded flex items-center justify-between px-3 py-4 w-full"
      >
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
          <p className="prose-sm mt-2 text-neutral-900 dark:text-neutral-100">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <section>
      <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">work 👨‍💻</h1>
      <ul>
        {work.map((job) => (
          <ExperienceCard
          name={job.name}
          dates={job.dates}
          post={job.position}
          description={job.description}
          />
        ))}
      </ul>
      </div>
      <div>
      <h1 className="font-medium text-2xl mb-8 mt-12 tracking-tighter">education 👨‍🎓</h1>
      <ul>
      {education.map((school) => (
        <ExperienceCard
        name={school.name}
        dates={school.dates}
        post={school.qual}
        description={null}
      />
      ))}
    </ul>
      </div>
    </section>
  );
}
