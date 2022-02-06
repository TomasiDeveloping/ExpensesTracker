using System.Threading;
using Microsoft.Extensions.Configuration;
using OpenQA.Selenium;

namespace ExpensesTrackerTests.UITests.Helper
{
    public class LoginPage
    {

        private readonly IWebDriver _driver;
        private readonly IConfigurationRoot _config;

        public LoginPage(IWebDriver driver)
        {
            _driver = driver;
            _config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.test.json")
                .Build();
        }

        public void Login()
        {
            _driver.Navigate().GoToUrl(_config["ApplicationUrl"]);
            _driver.FindElement(By.Id("inputEmail")).SendKeys(_config["TestUserEmail"]);
            _driver.FindElement(By.Id("inputPassword")).SendKeys(_config["TestUserPassword"]);
            _driver.FindElement(By.TagName("Button"))
                .Click();
            Thread.Sleep(5000);
        }
    }
}