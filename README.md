# APItest
postman+nodejs+newman+jenkins
# jenkins settings
@echo off

if not exist api-postman-autotestframe (

git clone https://github.com/TestCorn/api-postman-autotestframe.git
    
cd api-postman-autotestframe
    
call npm init -y
    
call npm install newman nodemailer newman-reporter-html http
    
) else (

cd api-postman-autotestframe
    
git pull
    
)

call node .\APISmokeTest.js sncwpexbhqbsbebc 1a7b83c02e490938aa6f24b17428361e

exit 0
