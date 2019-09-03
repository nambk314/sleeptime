#Publish template for lambda
rm index.zip
cd lambda
zip -X -r ../index.zip *
cd ..
aws lambda update-function-code --function-name SleepTime --zip-file fileb://index.zip
