CREATE DATABASE IF NOT EXISTS KitchenSync;
USE KitchenSync;

CREATE TABLE IF NOT EXISTS Users (
	user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    passwd VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Cookbooks (
	book_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    cookbook_name VARCHAR(50) NOT NULL,
    cookbook_desc VARCHAR(150),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS SharedCookbooks (
	book_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (book_id, user_id),
    FOREIGN KEY (book_id) REFERENCES Cookbooks(book_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Recipes (
	recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    contributor_id INT NOT NULL,
    recipe_name VARCHAR(50) NOT NULL,
    image MEDIUMBLOB,
    FOREIGN KEY (book_id) REFERENCES Cookbooks(book_id),
    FOREIGN KEY (contributor_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS RecipeSteps (
	step_id INT AUTO_INCREMENT PRIMARY KEY,
    step_num INT NOT NULL,
    from_recipe INT NOT NULL,
    ingredient_name VARCHAR(50),
    ingredient_amount DECIMAL(6,2),
    ingredient_unit VARCHAR(6),
    step_desc VARCHAR(200),
    FOREIGN KEY (from_recipe) REFERENCES Recipes(recipe_id)
);