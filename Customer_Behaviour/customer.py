import pandas as pd
from sqlalchemy import create_engine

df = pd.read_csv('customer_shopping_behavior.csv')

# print(df.head())
# print(df.info())
# print(df.describe())
# print(df.isnull().sum())

df.columns = df.columns.str.lower()
df.columns = df.columns.str.replace(' ','_')
df = df.rename(columns={'purchase_amount_(usd)':'purchase_amount'})
df['review_rating'] = df.groupby('category')['review_rating'].transform(lambda x: x.fillna(x.mean()))
# print(df.isnull().sum())
df.columns = df.columns.str.lower()
df.columns = df.columns.str.replace(' ', '_')
# print(df.columns)


# creat a coloumn for age_group
labels = ['Young Adult', 'Adult', 'Middle_age','Senior']
df['age_group'] = pd.qcut(df['age'], q=4,labels=labels)
# print(df[['age','age_group']].head(10))


# creating Purches frequency days
frequency_mapping = {
    'Fortnightly': 14,
    'Weekly': 7,
    'Monthly': 30,
    'Quarterly': 90,
    'Annually': 365,
    'Bi-Weekly': 14,
    'Every 3 Months': 90
}
df['purchase_frequency_days'] = df['frequency_of_purchases'].map(frequency_mapping)
# print(df[['frequency_of_purchases', 'purchase_frequency_days']].head(10))


# Step 1: Connect to PostgreSQL
# Replace placeholders with your actual details
username = "postgres"      # default user
password = "moumita123" # the password you set during installation
host = "localhost"         # if running locally
port = "5432"              # default PostgreSQL port
database = "coustomer_behavior"    # the database you created in pgAdmin

engine = create_engine(f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}")

# Step 2: Load DataFrame into PostgreSQL
table_name = "customer"   # choose any table name
df.to_sql(table_name, engine, if_exists="replace", index=False)

print(f"Data successfully loaded into table '{table_name}' in database '{database}'.")