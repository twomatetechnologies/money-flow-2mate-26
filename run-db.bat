
@echo off
echo Starting Money Flow Guardian Database and pgAdmin...
docker-compose -f docker-compose.db.yml up -d

echo.
echo Database is running on localhost:5432
echo pgAdmin is available at http://localhost:5050
echo Login to pgAdmin with:
echo   Email: pg.admin@example.com
echo   Password: admin123
