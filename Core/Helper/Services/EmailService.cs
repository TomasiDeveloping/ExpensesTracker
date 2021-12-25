using System.Net;
using System.Net.Mail;
using Core.Helper.Classes;
using Microsoft.Extensions.Options;

namespace Core.Helper.Services
{
    public class EmailService
    {

        private readonly string _host;
        private readonly int _port;
        private readonly string _userName;
        private readonly string _password;
        private readonly string _senderAddress;


        public EmailService(IOptions<EmailSettings> conf)
        {
            _host = conf.Value.Host;
            _port = conf.Value.Port;
            _userName = conf.Value.UserName;
            _password = conf.Value.Password;
            _senderAddress = conf.Value.SenderAddress;
        }

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
