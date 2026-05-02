import Link from "next/link";
import MemberCard from "../components/shared/MemberCard";


const MEMBERS =[
  {
    id: 1,
    name: "Стёпка Феоктистов",
    role: "Опустошитель #01",
    description: "Человек, с которого началась наша идеология. Задал тренд, рэпер, полиглот. Но помнит главное: в братстве все равны, а вектор развития решает только общий Совет.",
    imageUrl: "/stepa.jpg",
    socials: { tg: "https://t.me/Pureluxure" }
  },
  {
    id: 2,
    name: "Дёня Рамошка",
    role: "Опустошитель #02",
    description: "Наш красавчик на страже порядка города. Вайбовый братка, который раздает стиль и делает крутые треки.",
    imageUrl: "/denya.jpg",
    socials: { tg: "https://t.me/kiskeayng" }
  },
  {
    id: 3,
    name: "Серёжа Цапенко",
    role: "Опустошитель #03 / IT",
    description: "Технический мозг братства и бизнесмен. Создатель этого цифрового пространства и человек, воплощающий наши идеи в код.",
    imageUrl: "/serezha.jpg",
    socials: { tg: "https://t.me/avenuetsa" }
  },
  {
    id: 4,
    name: "Данька Вайверов",
    role: "Опустошитель #04",
    description: "Если ты не шаришь за мелон мьюзик не пиши мне. Укус вампира и бурик, амбассадор всех тусовок и просто зачётный парень",
    imageUrl: "/danka.jpg",
    socials: { tg: "https://t.me/purpurbl4" }
  },
  {
    id: 5,
    name: "Веталь Степаненко",
    role: "Опустошитель #05",
    description: "aka Витька. Наш бармен, к которому мы гоняем тусоваться во Псков. Мастер выдать забавную дичь, с которой угарает весь Совет.",
    imageUrl: "/vetal.jpg",
    socials: { tg: "https://t.me/VitaliambaSkalik" }
  },
  {
    id: 6,
    name: "Михыч Шалопаев",
    role: "Опустошитель #06",
    description: "Со Степкой с раннего возраста. Был его наставником, но ученик превзошел своего учителя, но это лишь повод для гордости. Разговаривает с компьютерами больше чем с женщинами и не видит в этом никак проблем. Мечтает о том, чтобы все члены Опустошателей жили в Тайланде в полном чилле и гармонии..",
    imageUrl: "/mixa.jpg",
    socials: { tg: "https://t.me/Mxch_4" }
  } 
];

export default function Home() {
  return (
     <main className="flex flex-col w-full min-h-screen overflow-x-hidden">
      
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-[7.5vw] sm:text-5xl md:text-7xl lg:text-9xl font-playfair tracking-wider sm:tracking-widest uppercase mb-6 text-zinc-100 whitespace-nowrap">
          Опустошатели
        </h1>
        <p className="text-xs md:text-sm lg:text-base font-inter text-zinc-400 tracking-[0.3em] uppercase mb-16 max-w-2xl">
          Саморазвитие • Бизнес • Музыка • Стиль жизни
        </p>
        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link href="/manifest" className="px-10 py-4 border border-zinc-700 hover:border-zinc-300 text-zinc-300 hover:text-white transition-all duration-300 font-inter text-xs tracking-widest uppercase">
            Наш манифест
          </Link>
          <Link href="/apply" className="px-10 py-4 bg-zinc-100 text-zinc-950 hover:bg-white transition-all duration-300 font-inter text-xs tracking-widest uppercase font-medium">
            Присоединиться
          </Link>
        </div>
      </section>

      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center mb-20 text-center">
          <h2 className="text-3xl md:text-5xl font-playfair tracking-widest uppercase mb-6 text-zinc-100">
            Состав опустошателей
          </h2>
          <div className="w-16 h-px bg-zinc-700"></div> 
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MEMBERS.map((member, index) => (
            <MemberCard 
              key={member.id}
              name={member.name}
              role={member.role}
              description={member.description}
              imageUrl={member.imageUrl}
              socials={member.socials}
              priority={index < 3}
            />
          ))}
        </div>
      </section>

    </main>
  );
}