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
        ('Семь самураев', 'Глава мафиозной семьи передаёт власть сыну.', 'Драма', 1972, 'https://st.kp.yandex.net/images/film_iphone/iphone360_332.jpg', 4.6),
        ('Тёмный рыцарь', 'Бэтмен сражается с Джокером.', 'Экшн', 2008, 'https://st.kp.yandex.net/images/film_iphone/iphone360_111543.jpg', 4.5),
        ('Криминальное чтиво', 'Переплетающиеся истории двух киллеров.', 'Криминал', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_342.jpg', 4.5),
        ('Властелин колец: Возвращение короля', 'Фродо и Сэм достигают Мордора.', 'Фэнтези', 2003, 'https://st.kp.yandex.net/images/film_iphone/iphone360_312.jpg', 4.5),
        ('Властелин колец', 'Простодушный парень становится свидетелем истории.', 'Драма', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 4.4),
        ('Начало', 'Вор, крадущий идеи из снов.', 'Фантастика', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_447301.jpg', 4.4),
        ('Матрица', 'Программист узнаёт, что реальность — это симуляция.', 'Фантастика', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_301.jpg', 4.4),
        ('Крестный Отец', 'Смотритель тюрьмы и заключённый с даром.', 'Драма', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_325.jpg', 4.5),
        ('Бойцовский клуб', 'Офисный работник создаёт подпольный клуб.', 'Триллер', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_361.jpg', 4.3),
        ('Амели', 'Профессиональный киллер и девочка.', 'Боевик', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_341.jpg', 4.3),
        ('Интерстеллар', 'Путешествие через червоточину.', 'Фантастика', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_258687.jpg', 4.3),
        ('Человек-слон', 'Римский генерал становится гладиатором.', 'Экшн', 2000, 'https://st.kp.yandex.net/images/film_iphone/iphone360_464.jpg', 4.3),
        ('1+1', 'Аристократ и его сиделка.', 'Драма', 2011, 'https://st.kp.yandex.net/images/film_iphone/iphone360_535341.jpg', 4.3),
        ('Список Шиндлера', 'Немецкий бизнесмен спасает евреев.', 'Драма', 1993, 'https://st.kp.yandex.net/images/film_iphone/iphone360_329.jpg', 4.5),
        ('Достать ножи', 'Пианист и его водитель в турне.', 'Драма', 2018, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1188529.jpg', 4.3),
        ('Семь', 'Девочка в мире духов.', 'Аниме', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_377.jpg', 4.3),
        ('Убойный футбол', 'Шесть мастеров кунг-фу и футбольный тренер объединяются в чудо-команду, чтобы выиграть престижное первенство.', 'Комедия', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_833.jpg', 3.5),
        ('Подводная лодка', 'Конфликт между богами и людьми.', 'Аниме', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_362.jpg', 4.2),
        ('Поющие под дождем', 'Чувак ищет миллион долларов.', 'Комедия', 1998, 'https://st.kp.yandex.net/images/film_iphone/iphone360_368.jpg', 3.9),
        ('Пролетая над гнездом кукушки', 'Писатель сходит с ума в отеле.', 'Ужасы', 1980, 'https://st.kp.yandex.net/images/film_iphone/iphone360_336.jpg', 4.0),
        ('Мальтийский сокол', 'Детективы расследуют убийства по грехам.', 'Триллер', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_366.jpg', 4.2),
        ('Звездные войны', 'История любви на тонущем лайнере.', 'Драма', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_338.jpg', 4.1),
        ('Аватар', 'Парализованный морпех на Пандоре.', 'Фантастика', 2009, 'https://st.kp.yandex.net/images/film_iphone/iphone360_251733.jpg', 4.1),
        ('Терминатор 2: Судный день', 'Киборг защищает мальчика.', 'Фантастика', 1991, 'https://st.kp.yandex.net/images/film_iphone/iphone360_355.jpg', 4.2),
        ('Реквием по мечте', 'Путешествие во времени на ДеЛореане.', 'Фантастика', 1985, 'https://st.kp.yandex.net/images/film_iphone/iphone360_367.jpg', 4.3),
        ('Молчание ягнят', 'Агент ФБР просит помощи у убийцы.', 'Триллер', 1991, 'https://st.kp.yandex.net/images/film_iphone/iphone360_345.jpg', 4.1),
        ('Остров проклятых', 'Детектив в психиатрической клинике.', 'Триллер', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_397667.jpg', 4.0),
        ('Славные парни', 'Реальная история о гангстере-информаторе.', 'Криминал', 1990, 'https://st.kp.yandex.net/images/film_iphone/iphone360_349.jpg', 4.0),
        ('Апокалипсис сегодня', 'Мафия контролирует казино в Лас-Вегасе.', 'Криминал', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_354.jpg', 4.1),
        ('Унесенные призраками', 'Полицейский борется с террористами в небоскрёбе.', 'Боевик', 1988, 'https://st.kp.yandex.net/images/film_iphone/iphone360_370.jpg', 4.0),
        ('Это случилось однажды ночью', 'Пират пытается вернуть свой корабль.', 'Приключения', 2003, 'https://st.kp.yandex.net/images/film_iphone/iphone360_437.jpg', 3.9),
        ('Семь самураев', 'Игрушки оживают, когда хозяина нет.', 'Анимация', 1995, 'https://st.kp.yandex.net/images/film_iphone/iphone360_332.jpg', 3.9),
        ('Звёздные войны', 'Капитан ликвидирует безумного полковника.', 'Военный', 1979, 'https://st.kp.yandex.net/images/film_iphone/iphone360_338.jpg', 3.9),
        ('Реквием по мечте', 'Солдаты ищут брата.', 'Военный', 1998, 'https://st.kp.yandex.net/images/film_iphone/iphone360_367.jpg', 4.0),
        ('Касабланка', 'Бунтарь в психиатрической лечебнице.', 'Драма', 1975, 'https://st.kp.yandex.net/images/film_iphone/iphone360_330.jpg', 4.3),
        ('Американская красота', 'Кризис среднего возраста.', 'Драма', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_351.jpg', 4.0),
        ('Афера', 'Отец спасает сына от ужасов концлагеря.', 'Драма', 1997, 'https://st.kp.yandex.net/images/film_iphone/iphone360_383.jpg', 4.3),
        ('Гражданин Кейн', 'Священник проводит экзорцизм.', 'Ужасы', 1973, 'https://st.kp.yandex.net/images/film_iphone/iphone360_331.jpg', 3.9),
        ('Гарри Поттер и философский камень', 'Мальчик узнаёт о своём магическом прошлом.', 'Приключения', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_689.jpg', 4.1),
        ('Властелин колец: Братство Кольца', 'Фродо отправляется в опасное путешествие.', 'Фэнтези', 2001, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 4.4),
        ('Касабланка', 'Менеджер выживает на необитаемом острове.', 'Драма', 2000, 'https://st.kp.yandex.net/images/film_iphone/iphone360_330.jpg', 4.0),
        ('Эта замечательная жизнь', 'Мошенник обманывает ФБР.', 'Криминал', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_348.jpg', 4.1),
        ('Мементо', 'Еврейский пианист выживает в Варшаве.', 'Драма', 2002, 'https://st.kp.yandex.net/images/film_iphone/iphone360_335.jpg', 4.2),
        ('Хороший. Плохой. Злой.', 'Дарт Вейдер преследует повстанцев, а Люк Скайуокер проходит обучение у мастера Йоды.', 'Фантастика', 1980, 'https://st.kp.yandex.net/images/film_iphone/iphone360_349.jpg', 4.2),
        ('Звёздные войны', 'Полицейский становится киборгом.', 'Фантастика', 1987, 'https://st.kp.yandex.net/images/film_iphone/iphone360_333.jpg', 3.8),
        ('Окно во двор', 'Элитный отряд против инопланетного охотника.', 'Экшн', 1987, 'https://st.kp.yandex.net/images/film_iphone/iphone360_337.jpg', 3.9),
        ('Лицо со шрамом', 'Беженец становится наркобароном.', 'Криминал', 1983, 'https://st.kp.yandex.net/images/film_iphone/iphone360_337.jpg', 4.1)
    `);
  }

  console.log('Database initialized with all tables');
  return db;
};
