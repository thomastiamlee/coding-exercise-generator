public class Main {
double func(double B, double A) {double temp =  B / 3.28084;
double s = temp * temp;
return A / s;}
public static void main(String[] args) {
Main o = new Main();
System.out.println(o.func(4.5,14.9));
System.out.println(o.func(18.4,16.7));
System.out.println(o.func(5.4,7.8));
System.out.println(o.func(13.8,4.6));
System.out.println(o.func(7.1,14.8));
System.out.println(o.func(2.4,5.1));
System.out.println(o.func(12.4,12.6));
System.out.println(o.func(0.5,2.8));
System.out.println(o.func(11.1,3.6));
System.out.println(o.func(2.5,15.7));
};
};
