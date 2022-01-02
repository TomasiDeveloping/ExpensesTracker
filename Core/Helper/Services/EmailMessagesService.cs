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
    }
}