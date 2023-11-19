using Core.Helper.Classes;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Core.Helper.Services
{
    public class EmailService(IOptions<EmailSettings> conf)
    {
        private readonly string _host = conf.Value.Host;
        private readonly int _port = conf.Value.Port;
        private readonly string _userName = conf.Value.UserName;
        private readonly string _password = conf.Value.Password;
        private readonly string _senderAddress = conf.Value.SenderAddress;

        public async Task<bool> SendEmailAsync(string receiverAddress, string message, string subject)
        {
            try
            {
                var smtpServer = new SmtpClient(_host, _port);
                var mail = new MailMessage();

                smtpServer.EnableSsl = false;
                smtpServer.Credentials = new NetworkCredential(_userName, _password);

                mail.From = new MailAddress(_senderAddress);
                mail.To.Add(receiverAddress);
                mail.Subject = subject;
                mail.Body = message;
                mail.IsBodyHtml = true;

                await smtpServer.SendMailAsync(mail);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}