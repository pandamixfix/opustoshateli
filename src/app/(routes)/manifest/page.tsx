import Link from "next/link";

const RULES =[
  {
    numeral: "I",
    title: "Абсолютное уважение",
    text: "Опустошатели уважают друг друга и никогда не пиздят друг на друга за спиной. Любое недопонимание решается прямо, глядя в глаза, в Совете. Интриги мы оставляем слабым."
  },
  {
    numeral: "II",
    title: "Закон примирения",
    text: "Гордыня разрушает союзы. Идеальных людей нет, но есть умение нести ответственность за свои слова. Если ты перешел черту, был не прав или обидел кого-то из своих — всегда откинь сорямбика. Признать ошибку перед своим кругом — это признак силы."
  },
  {
    numeral: "III",
    title: "Вес слова",
    text: "Слово Опустошателя — это его главная валюта, и она стоит дороже любых денег. Если ты дал слово нашему кругу — ты обязан это сделать. Назад пути нет. Исключением может стать только по-настоящему веская причина. Пустословам среди нас нет места."
  },
  {
    numeral: "IV",
    title: "Вектор развития",
    text: "Опустошатели — это непрерывное движение наверх. Мы уничтожаем в себе лень, чтобы наполнить жизнь смыслом. Обязательное саморазвитие, бизнес, работа, деньги, ухоженная красивая внешность и тотальный успех. Мы тянем друг друга на вершину и не согласны на меньшее."
  }
];

export default function ManifestPage() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-20 px-6">
      
      <div className="max-w-4xl w-full flex flex-col items-center text-center mb-24">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">
          Философия закрытого клуба
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair tracking-widest uppercase mb-10 text-zinc-100">
          Манифест
        </h1>
        <div className="w-px h-24 bg-linear-to-b from-zinc-500 to-transparent mb-10"></div>
        <p className="text-sm md:text-base font-inter text-zinc-400 leading-relaxed max-w-2xl text-justify md:text-center">
          Мы начинали с локального вайба, но превратили его в абсолютный стандарт жизни. 
          Быть Опустошителем — значит избавиться от слабостей, страхов и сомнений, 
          чтобы освободить место для величия, богатства и наследия. Это наш кодекс.
        </p>
      </div>

      <div className="max-w-4xl w-full flex flex-col gap-16 md:gap-24">
        {RULES.map((rule) => (
          <div key={rule.numeral} className="relative flex flex-col md:flex-row gap-6 md:gap-16 group">
            
            <div className="hidden md:flex flex-col items-center">
              <span className="text-6xl font-playfair text-zinc-800 group-hover:text-zinc-600 transition-colors duration-500">
                {rule.numeral}
              </span>
              <div className="w-px h-full bg-zinc-900 mt-4 group-hover:bg-zinc-700 transition-colors duration-500"></div>
            </div>

            <div className="flex flex-col md:w-[80%] pt-2">
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                <span className="text-3xl font-playfair text-zinc-600 md:hidden">
                  {rule.numeral}.
                </span>
                <h2 className="text-2xl md:text-3xl font-playfair tracking-widest text-zinc-200 uppercase">
                  {rule.title}
                </h2>
              </div>
              <p className="text-sm font-inter text-zinc-400 leading-relaxed text-justify">
                {rule.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl w-full mt-32 flex justify-center border-t border-zinc-900 pt-16">
        <Link 
          href="/apply" 
          className="group flex flex-col items-center gap-4 hover:opacity-70 transition-opacity"
        >
          <span className="text-[10px] font-inter tracking-[0.3em] text-zinc-500 uppercase group-hover:text-zinc-300">
            Разделяешь наши взгляды?
          </span>
          <span className="text-sm font-inter tracking-widest text-zinc-100 uppercase border-b border-zinc-700 pb-1">
            Подать заявку на резидентуру
          </span>
        </Link>
      </div>

    </main>
  );
}