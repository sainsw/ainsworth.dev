import { workerData } from "worker_threads";

const education = [
  {
    name: 'University of Liverpool, UK',
    dates: '2013 - 2016',
    qual: 'Computer Science BSc',
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
    position: 'Senior Software Engineer'
  },
  {
    name: 'Bott & Company Solicitors',
    dates: '2016 - 2020',
    position: 'C# Software Developer'
  },
  {
    name: 'WHSmith',
    dates: '2012 - 2016',
    position: 'Sales Assistant'
  }
]

function ExperienceCard({ name, dates, post }) {
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
      />
      ))}
    </ul>
      </div>
    </section>
  );
}
