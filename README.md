# react-konva-server

Предполагается что у вас уже есть MongoDB на вашем компьютере и рабоатает под стандартным портом.
Перед попыткой авторизоваться отправьте POST запрос на localhost:5000/api/register со следующим payload
```
{
  email : admin@admin.cm
  password :123456
  name : Admin
} 
```

Curl
```
curl --location --request POST 'http://localhost:5000/api/register' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'email=admin@admin.com' \
--data-urlencode 'password=123456' \
--data-urlencode 'name=Admin'
```
