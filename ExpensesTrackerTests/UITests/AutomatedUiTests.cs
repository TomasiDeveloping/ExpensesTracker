using ExpensesTrackerTests.UITests.Helper;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Threading;
using Xunit;

namespace ExpensesTrackerTests.UITests
{
    [Trait("Navigation", "UI")]
    public class AutomatedUiTests : IDisposable
    {
        private readonly IWebDriver _driver;
        private readonly LoginPage _loginPage;

        public AutomatedUiTests()
        {
            _driver = new ChromeDriver();
            _loginPage = new LoginPage(_driver);
        }

        [Fact]
        public void Navigate_Home()
        {
            _loginPage.Login();
            var content = _driver.FindElement(By.ClassName("container"));
            var buttons = content.FindElements(By.TagName("Button"));

            Assert.Equal(2, buttons.Count);
            Assert.Contains(DateTime.Now.Year.ToString(), _driver.FindElement(By.ClassName("beams")).Text);
        }

        [Fact]
        public void NavigationBar_Tests()
        {
            _loginPage.Login();

            // Ausgaben
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[2]/a")).Click();
            Thread.Sleep(1000);
            Assert.Contains("Ausgaben", _driver.FindElement(By.TagName("h2")).Text);

            // Einnahmen
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[3]/a")).Click();
            Thread.Sleep(1000);
            Assert.Equal("Einnahmen", _driver.FindElement(By.TagName("h2")).Text);

            // Kategorien
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[4]/a")).Click();
            Thread.Sleep(1000);
            Assert.Equal("Kategorien", _driver.FindElement(By.TagName("h2")).Text);

            // Statistiken
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[5]/a")).Click();
            Thread.Sleep(1000);
            Assert.Equal("Statistiken", _driver.FindElement(By.TagName("h2")).Text);

            // Einstellungen
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[6]/a")).Click();
            Thread.Sleep(1000);
            Assert.Equal("Einstellungen", _driver.FindElement(By.TagName("h2")).Text);

            // Logout
            _driver.FindElement(By.XPath("/html/body/app-root/app-nav/nav/div/div/ul/li[7]/a")).Click();
            Thread.Sleep(1000);
            Assert.Equal("Kostenmanager", _driver.FindElement(By.TagName("h1")).Text);
        }

        public void Dispose()
        {
            _driver.Quit();
            _driver.Dispose();
        }
    }
}