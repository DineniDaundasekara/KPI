namespace backend.Helpers
{
    public interface IDateHelper
    {
        bool IsEditWindowOpen();
    }

    public class DateHelper : IDateHelper
    {
        public bool IsEditWindowOpen()
        {
            return DateTime.Now.Day <= 15;
        }
    }
}
