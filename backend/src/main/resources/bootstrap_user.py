import pandas as pd
import bcrypt

# List of bootstrap users: (firstname, lastname, level, title)
users = [
    ("Lisbeth", "Monroe", 3, "Provost"),
    ("Jacob", "Weiner", 3, "Registrar"),
    ("Robert", "Flood", 3, "Budget Officer"),
    ("Rachel", "Marcos", 3, "Dean of Engineering"),
    ("Brandon", "Richman", 2, "Department Chair"),
    ("Melinda", "Norman", 2, "Department Chair"),
    ("Kim", "Dillon", 2, "Graduate Program Director"),
    ("Erica", "Cobb", 2, "Undergraduate Program Director"),
    ("Christie", "Walker", 1, "Faculty Member"),
    ("Xu", "Zhang", 1, "Faculty Member"),
    ("Ibrahim", "Mohammad", 1, "Faculty Member"),
    ("Aryan", "Savane", 1, "Faculty Member"),
    ("Anne", "Swanson", 1, "Faculty Member"),
    ("Mike", "Ruth", 1, "Faculty Member"),
    ("Ahalya", "Promod", 1, "Librarian"),
    ("Shasha", "Brunswick", 1, "Librarian"),
    ("Delores", "Bensen", 0, "Student"),
    ("Shirley", "Albert", 0, "Student"),
    ("Daniel", "Wong", 0, "Student"),
    ("Riku", "Suzuki", 0, "Student"),
    ("Isabella", "Leonardo", 0, "Student"),
    ("Arjun", "Mahajan", 0, "Student"),
    ("Lei", "Huang", 0, "Student"),
    ("Rajan", "Kishore", 0, "Student")
]

fixed_email = "tranlamngocthao1106@gmail.com"

# Define all distinct titles
titles = list({
    "Provost",
    "Registrar",
    "Budget Officer",
    "Dean of Engineering",
    "Department Chair",
    "Graduate Program Director",
    "Undergraduate Program Director",
    "Faculty Member",
    "Librarian",
    "Student"
})
titles.sort()
title_id_map = {title: i + 2 for i, title in enumerate(titles)}

sql_lines = []

# Insert into user_titles
sql_lines.append("-- Insert titles")
for title, title_id in title_id_map.items():
    sql_lines.append(
        f"INSERT INTO user_titles (title_id, title) VALUES ({title_id}, '{title}');"
    )

# Insert users and credentials
sql_lines.append("\n-- Insert users and credentials")
for firstname, lastname, level, title in users:
    username = (firstname[0] + lastname).lower()
    password_plain = username
    hashed_pw = bcrypt.hashpw(password_plain.encode(
        'utf-8'), bcrypt.gensalt()).decode('utf-8')
    title_id = title_id_map[title]

    sql_lines.append(
        f"INSERT INTO users (username, title_id, firstname, lastname, level, email) "
        f"VALUES ('{username}', {title_id}, '{firstname}', '{lastname}', {level}, '{fixed_email}');"
    )
    sql_lines.append(
        f"INSERT INTO credentials (username, password, login_first_time) "
        f"VALUES ('{username}', '{hashed_pw}', TRUE);"
    )

# Write to SQL file
with open("./bootstrap_users.sql", "w") as f:
    for line in sql_lines:
        f.write(line + "\n")
