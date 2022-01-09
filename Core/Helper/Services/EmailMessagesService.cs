using System.Text;
using Core.Helper.Classes;

namespace Core.Helper.Services
{
    public class EmailMessagesService
    {
        public static string CreateForgotPasswordMessage(string clearTextPassword)
        {
            return $"<h2>Neues Passwort Kosetenmanager</h2><br>" +
                   $"<p>Neues Passwort: <b>{clearTextPassword}</b><br>" +
                   $"<p>Bitte ändere das Passwort beim nächsten Login.</p><br>" +
                   $"<p>Freundliche Grüsse</p>" +
                   $"<p>Kostenmanager Support</p>" +
                   $"<br>" +
                   $"<small>Diese E-Mail wurde automatisch generiert, bitte nicht auf diese E-Mail Antworten</small>";
        }

        public static string CreateContactMessage(SupportContactMessage contactMessage)
        {
            return $"<h2>Kontakt von Kostenmanager</h2><br><br><p>Email von {contactMessage.Email}</p>" +
                   $"<br><h3>{contactMessage.Subject}</h3><br>" +
                   $"<p>{GetText(contactMessage.Message)}</p>";
        }

        private static string GetText(string messageContent)
        {
            var stringBuilder = new StringBuilder();
            var lines = messageContent.Split("\n");
            foreach (var line in lines)
            {
                stringBuilder.Append(line + "<br>\n");
            }

            return stringBuilder.ToString();
        }
    }
}