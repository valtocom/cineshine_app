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
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      year INTEGER NOT NULL,
      rating REAL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id)
    );
  `);
  
  // Тестовые фильмы
  const movies = await db.all('SELECT * FROM movies');
  if (movies.length === 0) {
    await db.exec(`
      INSERT INTO movies (title, genre, year) VALUES
      ('Побег из Шоушенка', 'Драма', 1994),
      ('Крёстный отец', 'Драма', 1972),
      ('Тёмный рыцарь', 'Экшн', 2008),
      ('Криминальное чтиво', 'Криминал', 1994),
      ('Властелин колец: Возвращение короля', 'Фэнтези', 2003),
      ('Форрест Гамп', 'Драма', 1994),
      ('Начало', 'Фантастика', 2010),
      ('Матрица', 'Фантастика', 1999),
      ('Список Шиндлера', 'Драма', 1993),
      ('Зелёная книга', 'Драма', 2018)
    `);
  }
  
  return db;
};
