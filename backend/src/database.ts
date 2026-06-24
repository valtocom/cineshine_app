import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const openDB = async () => {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
};

export const initDB = async () => {
  const db = await openDB();
  
  // Таблица users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица movies
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      year INTEGER,
      poster_url TEXT,
      trailer_url TEXT,
      avg_rating REAL DEFAULT 0,
      ratings_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица user_ratings
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      UNIQUE(user_id, movie_id)
    )
  `);

  // Таблица friendships
  await db.exec(`
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    )
  `);

  // Таблица friend_requests
  await db.exec(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      UNIQUE(from_user_id, to_user_id)
    )
  `);

  // Таблица comments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id)
    )
  `);

  // Таблица watchlist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      UNIQUE(user_id, movie_id)
    )
  `);

const movies = await db.all('SELECT * FROM movies');
if (movies.length === 0) {
  await db.exec(`
    INSERT INTO movies (title, description, genre, year, poster_url, avg_rating) VALUES
      ('Побег из Шоушенка', 'Два заключённых находят дружбу и искупление.', 'Драма', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_326.jpg', 4.7),
      ('Крёстный отец', 'Глава мафиозной семьи передаёт власть сыну.', 'Драма', 1972, 'https://st.kp.yandex.net/images/film_iphone/iphone360_332.jpg', 4.6),
      ('Тёмный рыцарь', 'Бэтмен сражается с Джокером в Готэме.', 'Экшн', 2008, 'https://st.kp.yandex.net/images/film_iphone/iphone360_111543.jpg', 4.5),
      ('Криминальное чтиво', 'Переплетающиеся истории двух киллеров.', 'Криминал', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_342.jpg', 4.5),
      ('Властелин колец: Возвращение короля', 'Фродо и Сэм достигают Мордора.', 'Фэнтези', 2003, 'https://st.kp.yandex.net/images/film_iphone/iphone360_312.jpg', 4.5),
      ('Форрест Гамп', 'Простодушный парень становится свидетелем истории.', 'Драма', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 4.4),
      ('Начало', 'Вор, крадущий идеи из снов.', 'Фантастика', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_447301.jpg', 4.4),
      ('Матрица', 'Программист узнаёт, что реальность — это симуляция.', 'Фантастика', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_301.jpg', 4.4),
      ('Список Шиндлера', 'Немецкий бизнесмен спасает евреев.', 'Драма', 1993, 'https://st.kp.yandex.net/images/film_iphone/iphone360_329.jpg', 4.5),
      ('Зелёная миля', 'Смотритель тюрьмы и заключённый с даром.', 'Драма', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_325.jpg', 4.5),
      ('Бойцовский клуб', 'Офисный работник создаёт подпольный клуб.', 'Триллер', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_361.jpg', 4.3),
      ('Леон', 'Профессиональный киллер и девочка.', 'Боевик', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_341.jpg', 4.3),
      ('Интерстеллар', 'Путешествие через червоточину.', 'Фантастика', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_258687.jpg', 4.3),
      ('Гладиатор', 'Римский генерал становится гладиатором.', 'Экшн', 2000, 'https://st.kp.yandex.net/images/film_iphone/iphone360_464.jpg', 4.3),
      ('1+1', 'Аристократ и его сиделка.', 'Драма', 2011, 'https://st.kp.yandex.net/images/film_iphone/iphone360_535341.jpg', 4.3),
      ('Отель Гранд Будапешт', 'Приключения консьержа.', 'Комедия', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_698217.jpg', 4.1),
      ('Джанго освобождённый', 'Охотник за головами.', 'Криминал', 2012, 'https://st.kp.yandex.net/images/film_iphone/iphone360_586309.jpg', 4.2),
      ('Зелёная книга', 'Пианист и его водитель в турне.', 'Драма', 2018, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1188529.jpg', 4.3),
      ('Джокер', 'Падение комика в безумие.', 'Триллер', 2019, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1143242.jpg', 4.4),
      ('Оппенгеймер', 'Создатель атомной бомбы.', 'Биография', 2023, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1123456.jpg', 4.3),
      ('Унесённые призраками', 'Девочка в мире духов.', 'Аниме', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_377.jpg', 4.3),
      ('Ходячий замок', 'Шляпница и волшебный замок.', 'Аниме', 2004, 'https://st.kp.yandex.net/images/film_iphone/iphone360_833.jpg', 4.1),
      ('Принцесса Мононоке', 'Конфликт между богами и людьми.', 'Аниме', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_362.jpg', 4.2),
      ('Большой Лебовски', 'Чувак ищет миллион долларов.', 'Комедия', 1998, 'https://st.kp.yandex.net/images/film_iphone/iphone360_368.jpg', 3.9),
      ('Сияние', 'Писатель сходит с ума в отеле.', 'Ужасы', 1980, 'https://st.kp.yandex.net/images/film_iphone/iphone360_336.jpg', 4.0),
      ('Оно', 'Дети сталкиваются со злым клоуном.', 'Ужасы', 2017, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1053182.jpg', 3.8),
      ('Семь', 'Детективы расследуют убийства по грехам.', 'Триллер', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_366.jpg', 4.2),
      ('Титаник', 'История любви на тонущем лайнере.', 'Драма', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_338.jpg', 4.1),
      ('Аватар', 'Парализованный морпех на Пандоре.', 'Фантастика', 2009, 'https://st.kp.yandex.net/images/film_iphone/iphone360_251733.jpg', 4.1),
      ('Терминатор 2: Судный день', 'Киборг защищает мальчика.', 'Фантастика', 1991, 'https://st.kp.yandex.net/images/film_iphone/iphone360_355.jpg', 4.2),
      ('Назад в будущее', 'Путешествие во времени на ДеЛореане.', 'Фантастика', 1985, 'https://st.kp.yandex.net/images/film_iphone/iphone360_367.jpg', 4.3),
      ('Индиана Джонс: В поисках утраченного ковчега', 'Археолог ищет ковчег.', 'Приключения', 1981, 'https://st.kp.yandex.net/images/film_iphone/iphone360_343.jpg', 4.1),
      ('Парк Юрского периода', 'Ожившие динозавры.', 'Фантастика', 1993, 'https://st.kp.yandex.net/images/film_iphone/iphone360_369.jpg', 4.2),
      ('Люди в чёрном', 'Секретные агенты следят за пришельцами.', 'Фантастика', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_105.jpg', 3.9),
      ('Пятый элемент', 'Спасение Вселенной от тьмы.', 'Фантастика', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_335.jpg', 4.1),
      ('Молчание ягнят', 'Агент ФБР просит помощи у убийцы.', 'Триллер', 1991, 'https://st.kp.yandex.net/images/film_iphone/iphone360_345.jpg', 4.1),
      ('Остров проклятых', 'Детектив в психиатрической клинике.', 'Триллер', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_397667.jpg', 4.0),
      ('Девушка с татуировкой дракона', 'Журналист и хакер расследуют исчезновение.', 'Триллер', 2011, 'https://st.kp.yandex.net/images/film_iphone/iphone360_471703.jpg', 3.9),
      ('Славные парни', 'Реальная история о гангстере-информаторе.', 'Криминал', 1990, 'https://st.kp.yandex.net/images/film_iphone/iphone360_349.jpg', 4.0),
      ('Казино', 'Мафия контролирует казино в Лас-Вегасе.', 'Криминал', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_354.jpg', 4.1),
      ('Таксист', 'Ветеран войны становится таксистом и очищает город.', 'Криминал', 1976, 'https://st.kp.yandex.net/images/film_iphone/iphone360_351.jpg', 4.0),
      ('Крепкий орешек', 'Полицейский борется с террористами в небоскрёбе.', 'Боевик', 1988, 'https://st.kp.yandex.net/images/film_iphone/iphone360_370.jpg', 4.0),
      ('Скорость', 'Полицейский обезвреживает бомбу в автобусе.', 'Боевик', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_348.jpg', 3.7),
      ('Пираты Карибского моря: Проклятие Чёрной жемчужины', 'Пират пытается вернуть свой корабль.', 'Приключения', 2003, 'https://st.kp.yandex.net/images/film_iphone/iphone360_437.jpg', 3.9),
      ('Король Лев', 'Молодой лев занимает место в круге жизни.', 'Анимация', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_335.jpg', 4.1),
      ('История игрушек', 'Игрушки оживают, когда хозяина нет.', 'Анимация', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_332.jpg', 3.9),
      ('Шрек', 'Зелёный огр спасает принцессу.', 'Анимация', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_435.jpg', 4.0),
      ('Апокалипсис сегодня', 'Капитан ликвидирует безумного полковника.', 'Военный', 1979, 'https://st.kp.yandex.net/images/film_iphone/iphone360_338.jpg', 3.9),
      ('Спасти рядового Райана', 'Солдаты ищут брата.', 'Военный', 1998, 'https://st.kp.yandex.net/images/film_iphone/iphone360_367.jpg', 4.0),
      ('Пролетая над гнездом кукушки', 'Бунтарь в психиатрической лечебнице.', 'Драма', 1975, 'https://st.kp.yandex.net/images/film_iphone/iphone360_330.jpg', 4.3),
      ('Американская красота', 'Кризис среднего возраста.', 'Драма', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_351.jpg', 4.0),
      ('Жизнь прекрасна', 'Отец спасает сына от ужасов концлагеря.', 'Драма', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_383.jpg', 4.3),
      ('Одержимость', 'Барабанщик и жестокий наставник.', 'Драма', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_729466.jpg', 4.2),
      ('Изгоняющий дьявола', 'Священник проводит экзорцизм.', 'Ужасы', 1973, 'https://st.kp.yandex.net/images/film_iphone/iphone360_331.jpg', 3.9),
      ('Гарри Поттер и философский камень', 'Мальчик узнаёт о своём магическом прошлом.', 'Приключения', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_689.jpg', 4.1),
      ('Гарри Поттер и Тайная комната', 'Гарри расследует загадку Тайной комнаты.', 'Приключения', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_812.jpg', 4.0),
      ('Гарри Поттер и узник Азкабана', 'Гарри узнаёт правду о своих родителях.', 'Приключения', 2004, 'https://st.kp.yandex.net/images/film_iphone/iphone360_828.jpg', 4.1),
      ('Гарри Поттер и Кубок огня', 'Турнир Трёх Волшебников.', 'Приключения', 2005, 'https://st.kp.yandex.net/images/film_iphone/iphone360_887.jpg', 4.0),
      ('Гарри Поттер и Орден Феникса', 'Подпольная организация против Волан-де-Морта.', 'Приключения', 2007, 'https://st.kp.yandex.net/images/film_iphone/iphone360_996.jpg', 3.9),
      ('Гарри Поттер и Принц-полукровка', 'Гарри узнаёт секреты Волан-де-Морта.', 'Приключения', 2009, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1017.jpg', 4.0),
      ('Гарри Поттер и Дары смерти: Часть 1', 'Гарри ищет крестражи.', 'Приключения', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1018.jpg', 3.9),
      ('Гарри Поттер и Дары смерти: Часть 2', 'Финальная битва за Хогвартс.', 'Приключения', 2011, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1019.jpg', 4.2),
      ('Властелин колец: Братство Кольца', 'Фродо отправляется в опасное путешествие.', 'Фэнтези', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 4.4),
      ('Властелин колец: Две крепости', 'Битва за Средиземье продолжается.', 'Фэнтези', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_329.jpg', 4.4),
      ('Звёздные войны: Новая надежда', 'Люк Скайуокер спасает принцессу Лею.', 'Фантастика', 1977, 'https://st.kp.yandex.net/images/film_iphone/iphone360_348.jpg', 4.1),
      ('Звёздные войны: Империя наносит ответный удар', 'Дарт Вейдер преследует повстанцев.', 'Фантастика', 1980, 'https://st.kp.yandex.net/images/film_iphone/iphone360_349.jpg', 4.2),
      ('Звёздные войны: Возвращение джедая', 'Финальная битва с Империей.', 'Фантастика', 1983, 'https://st.kp.yandex.net/images/film_iphone/iphone360_350.jpg', 4.0),
      ('Звёздные войны: Пробуждение силы', 'Новая героиня находит джедая.', 'Фантастика', 2015, 'https://st.kp.yandex.net/images/film_iphone/iphone360_659824.jpg', 4.0),
      ('Звёздные войны: Последние джедаи', 'Рей пытается убедить Люка.', 'Фантастика', 2017, 'https://st.kp.yandex.net/images/film_iphone/iphone360_659825.jpg', 3.8),
      ('Изгой', 'Менеджер выживает на необитаемом острове.', 'Драма', 2000, 'https://st.kp.yandex.net/images/film_iphone/iphone360_330.jpg', 4.0),
      ('Поймай меня, если сможешь', 'Мошенник обманывает ФБР.', 'Криминал', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_348.jpg', 4.1),
      ('Пианист', 'Еврейский пианист выживает в Варшаве.', 'Драма', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_335.jpg', 4.2),
      ('Малышка на миллион', 'Тренер тренирует девушку-боксёра.', 'Драма', 2004, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 4.1),
      ('Гран Торино', 'Ветеран войны защищает соседей от банды.', 'Драма', 2008, 'https://st.kp.yandex.net/images/film_iphone/iphone360_347.jpg', 4.0),
      ('Стрелок', 'Снайпер находит правду о своём прошлом.', 'Боевик', 2007, 'https://st.kp.yandex.net/images/film_iphone/iphone360_338.jpg', 3.6),
      ('Робокоп', 'Полицейский становится киборгом.', 'Фантастика', 1987, 'https://st.kp.yandex.net/images/film_iphone/iphone360_333.jpg', 3.8),
      ('Хищник', 'Элитный отряд против инопланетного охотника.', 'Экшн', 1987, 'https://st.kp.yandex.net/images/film_iphone/iphone360_337.jpg', 3.9),
      ('Чужие', 'Эллен Рипли против колонии ксеноморфов.', 'Экшн', 1986, 'https://st.kp.yandex.net/images/film_iphone/iphone360_336.jpg', 4.1),
      ('Космическая одиссея 2001 года', 'Исследование космоса и тайна монолита.', 'Фантастика', 1968, 'https://st.kp.yandex.net/images/film_iphone/iphone360_333.jpg', 3.9),
      ('Заводной апельсин', 'Жестокий юноша проходит лечение.', 'Криминал', 1971, 'https://st.kp.yandex.net/images/film_iphone/iphone360_334.jpg', 3.8),
      ('Собачий полдень', 'Ограбление банка идёт не по плану.', 'Криминал', 1975, 'https://st.kp.yandex.net/images/film_iphone/iphone360_335.jpg', 4.0),
      ('Лицо со шрамом', 'Беженец становится наркобароном.', 'Криминал', 1983, 'https://st.kp.yandex.net/images/film_iphone/iphone360_337.jpg', 4.1),
      ('Славные парни', 'Реальная история о гангстере-информаторе.', 'Криминал', 1990, 'https://st.kp.yandex.net/images/film_iphone/iphone360_349.jpg', 4.0)
  `);
}

  console.log('Database initialized with all tables');
  return db;
};
