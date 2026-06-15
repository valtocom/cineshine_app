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
    ('Побег из Шоушенка', 'Два заключённых находят дружбу и искупление за десятилетия, проведённые в стенах тюрьмы.', 'Драма', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_326.jpg', 9.3),
    ('Крёстный отец', 'Глава мафиозной семьи передаёт власть младшему сыну в эпоху перемен.', 'Драма', 1972, 'https://st.kp.yandex.net/images/film_iphone/iphone360_332.jpg', 9.2),
    ('Тёмный рыцарь', 'Бэтмен сражается с Джокером, который сеет хаос в Готэме.', 'Экшн', 2008, 'https://st.kp.yandex.net/images/film_iphone/iphone360_111543.jpg', 9.0),
    ('Криминальное чтиво', 'Переплетающиеся истории двух киллеров, боксёра и жены гангстера.', 'Криминал', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_342.jpg', 8.9),
    ('Властелин колец: Возвращение короля', 'Фродо и Сэм достигают Мордора, а Гэндальф ведёт битву за Гондор.', 'Фэнтези', 2003, 'https://st.kp.yandex.net/images/film_iphone/iphone360_312.jpg', 8.9),
    ('Форрест Гамп', 'Простодушный парень становится свидетелем важнейших событий XX века.', 'Драма', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg', 8.8),
    ('Начало', 'Вор, крадущий идеи из снов, получает последнее задание.', 'Фантастика', 2010, 'https://st.kp.yandex.net/images/film_iphone/iphone360_447301.jpg', 8.8),
    ('Матрица', 'Программист узнаёт, что реальность — это симуляция.', 'Фантастика', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_301.jpg', 8.7),
    ('Список Шиндлера', 'Немецкий бизнесмен спасает более тысячи евреев во время Холокоста.', 'Драма', 1993, 'https://st.kp.yandex.net/images/film_iphone/iphone360_329.jpg', 8.9),
    ('Зелёная книга', 'Итальянский вышибала сопровождает чёрного пианиста в турне по Югу США.', 'Драма', 2018, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1188529.jpg', 8.5),
    ('Джокер', 'Психическое падение одинокого комика в безумие.', 'Триллер', 2019, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1143242.jpg', 8.7),
    ('Интерстеллар', 'Группа исследователей отправляется через червоточину в поисках нового дома.', 'Фантастика', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_258687.jpg', 8.6),
    ('Леон', 'Профессиональный киллер берёт под опеку девочку, семью которой убили.', 'Боевик', 1994, 'https://st.kp.yandex.net/images/film_iphone/iphone360_341.jpg', 8.5),
    ('Бойцовский клуб', 'Офисный работник и торговец мылом создают подпольный бойцовский клуб.', 'Триллер', 1999, 'https://st.kp.yandex.net/images/film_iphone/iphone360_361.jpg', 8.6),
    ('Гладиатор', 'Римский генерал становится гладиатором и мстит за смерть своей семьи.', 'Экшн', 2000, 'https://st.kp.yandex.net/images/film_iphone/iphone360_464.jpg', 8.5),
    ('Джанго освобождённый', 'Освобождённый раб становится охотником за головами.', 'Криминал', 2012, 'https://st.kp.yandex.net/images/film_iphone/iphone360_586309.jpg', 8.4),
    ('1+1', 'Аристократ, прикованный к инвалидной коляске, нанимает уличного парня в сиделки.', 'Драма', 2011, 'https://st.kp.yandex.net/images/film_iphone/iphone360_535341.jpg', 8.5),
    ('Отель «Гранд Будапешт»', 'Приключения консьержа в знаменитом отеле.', 'Комедия', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_698217.jpg', 8.1),
    ('Довод', 'Секретный агент использует инверсию времени для предотвращения Третьей мировой войны.', 'Фантастика', 2020, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1268663.jpg', 7.8),
    ('Дюна', 'Молодой аристократ должен защитить самую опасную планету во Вселенной.', 'Фантастика', 2021, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1341830.jpg', 8.0),
    ('Паразиты', 'Бедная семья внедряется в богатый дом под видом сотрудников.', 'Триллер', 2019, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1204482.jpg', 8.6),
    ('1917', 'Двое британских солдат должны доставить приказ, спасающий жизни.', 'Военный', 2019, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1245183.jpg', 8.3),
    ('Оппенгеймер', 'История создания атомной бомбы и её создателя.', 'Биография', 2023, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1123456.jpg', 8.5),
    ('Барби', 'Кукла Барби покидает идеальный мир и отправляется в реальность.', 'Комедия', 2023, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1234567.jpg', 7.0),
    ('Человек-паук: Через вселенные', 'Майлз Моралес путешествует по мультивселенной.', 'Анимация', 2018, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1111111.jpg', 8.4),
    ('Твоё имя', 'Двое подростков начинают загадочным образом меняться телами.', 'Аниме', 2016, 'https://st.kp.yandex.net/images/film_iphone/iphone360_8888888.jpg', 8.4),
    ('Мстители: Финал', 'Мстители собираются в последний раз, чтобы обратить деяния Таноса.', 'Экшн', 2019, 'https://st.kp.yandex.net/images/film_iphone/iphone360_1023456.jpg', 8.4),
    ('Стражи Галактики', 'Группа космических аутсайдеров спасает галактику.', 'Экшн', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_7777777.jpg', 8.0),
    ('Джон Уик', 'Бывший наёмник выходит на охоту из-за убитого щенка.', 'Экшн', 2014, 'https://st.kp.yandex.net/images/film_iphone/iphone360_6666666.jpg', 7.5),
    ('Безумный Макс: Дорога ярости', 'Побег через пустоши в мире после апокалипсиса.', 'Экшн', 2015, 'https://st.kp.yandex.net/images/film_iphone/iphone360_5555555.jpg', 7.9)
  `);
}

  console.log('Database initialized with all tables');
  return db;
};
