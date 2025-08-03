CREATE DATABASE IF NOT EXISTS KitchenSync;
USE KitchenSync;

CREATE TABLE IF NOT EXISTS Users (
	user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(50),
    passwd VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Cookbooks (
	book_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    cookbook_name VARCHAR(50),
    cookbook_desc VARCHAR(150),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS SharedCookbooks (
	book_id INT,
    user_id INT,
    FOREIGN KEY (book_id) REFERENCES Cookbooks(book_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Recipes (
	recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    contributor_id INT,
    recipe_name VARCHAR(50),
    image MEDIUMBLOB,
    FOREIGN KEY (book_id) REFERENCES Cookbooks(book_id),
    FOREIGN KEY (contributor_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS RecipeSteps (
	step_id INT AUTO_INCREMENT PRIMARY KEY,
    step_num INT,
    from_recipe INT,
    ingredient_name VARCHAR(50),
    ingredient_amount INT,
    ingredient_unit VARCHAR(6),
    step_desc VARCHAR(200),
    FOREIGN KEY (from_recipe) REFERENCES Recipes(recipe_id)
);