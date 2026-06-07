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

  // Добавляем тестовые фильмы (если таблица пуста)
  const movies = await db.all('SELECT * FROM movies');
  if (movies.length === 0) {
    await db.exec(`
      INSERT INTO movies (title, genre, year, description, avg_rating) VALUES
      ('Побег из Шоушенка', 'Драма', 1994, 'Два заключённых находят дружбу и искупление...', 9.3),
      ('Крёстный отец', 'Драма', 1972, 'Глава мафиозной семьи передаёт власть младшему сыну...', 9.2),
      ('Тёмный рыцарь', 'Экшн', 2008, 'Бэтмен сражается с Джокером, сеющим хаос в Готэме...', 9.0),
      ('Криминальное чтиво', 'Криминал', 1994, 'Переплетающиеся истории двух киллеров, боксёра и гангстера...', 8.9),
      ('Властелин колец: Возвращение короля', 'Фэнтези', 2003, 'Фродо и Сэм достигают Мордора...', 8.9),
      ('Форрест Гамп', 'Драма', 1994, 'Простодушный парень становится свидетелем важнейших событий XX века...', 8.8),
      ('Начало', 'Фантастика', 2010, 'Вор, крадущий идеи из снов, получает последнее задание...', 8.8),
      ('Матрица', 'Фантастика', 1999, 'Программист узнаёт, что реальность — это симуляция...', 8.7),
      ('Список Шиндлера', 'Драма', 1993, 'Немецкий бизнесмен спасает более тысячи евреев...', 8.9),
      ('Зелёная книга', 'Драма', 2018, 'Итальянский вышибала сопровождает чёрного пианиста...', 8.5)
    `);
  }

  console.log('Database initialized with all tables');
  return db;
};
