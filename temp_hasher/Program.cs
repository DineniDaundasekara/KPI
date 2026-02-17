using BCrypt.Net;

string password = "password";
string hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine(hash);
File.WriteAllText("hash.txt", hash);
